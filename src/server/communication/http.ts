import {sessionAccessResponse} from '@/server/auth/session';
import {CommunicationInputError, DraftConflictError} from '@/server/db/repositories/communication';

export function communicationErrorResponse(error: unknown): Response | null {
  if (error instanceof DraftConflictError) {
    return Response.json({accepted: false, error: error.message, currentVersion: error.currentVersion}, {status: 409, headers: {'Cache-Control': 'no-store'}});
  }
  if (error instanceof CommunicationInputError) {
    const status = error.code.includes('NOT_FOUND') ? 404 : error.code.includes('NOT_OWNED') || error.code.includes('NOT_CONNECTED') || error.code.includes('NOT_AUTHORIZED') ? 403 : 400;
    const conflict = error.code.includes('CONFLICT') || error.code.includes('IDEMPOTENCY_KEY_REUSED') || error.code === 'DRAFT_SEND_IN_PROGRESS';
    return Response.json({accepted: false, error: error.code}, {status: conflict ? 409 : status, headers: {'Cache-Control': 'no-store'}});
  }
  return sessionAccessResponse(error);
}

export function requiredString(body: Record<string, unknown>, key: string, maxLength = 256): string {
  const value = body[key];
  if (typeof value !== 'string' || !value.trim() || value.length > maxLength) throw new CommunicationInputError(`${key.toUpperCase()}_INVALID`);
  return value.trim();
}

export function optionalString(body: Record<string, unknown>, key: string, maxLength = 256): string | undefined {
  const value = body[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string' || value.length > maxLength) throw new CommunicationInputError(`${key.toUpperCase()}_INVALID`);
  return value.trim() || undefined;
}

export function parseCommunicationBody(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new CommunicationInputError('INVALID_JSON_BODY');
  return value as Record<string, unknown>;
}

export function parseReplyMode(value: unknown): 'REPLY' | 'REPLY_ALL' {
  if (value === 'REPLY' || value === 'REPLY_ALL') return value;
  throw new CommunicationInputError('UNSUPPORTED_REPLY_MODE');
}

export function optionalRecipients(value: unknown): {email: string}[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((candidate) => !candidate || typeof candidate !== 'object' || typeof (candidate as {email?: unknown}).email !== 'string')) {
    throw new CommunicationInputError('RECIPIENTS_INVALID');
  }
  return value.map((candidate) => ({email: (candidate as {email: string}).email}));
}

export function optionalResponsibilityBinding(value: unknown): {responsibilityId: string; aggregateVersion: number; evidenceRevision: number} | undefined {
  if (value === undefined || value === null) return undefined;
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new CommunicationInputError('RESPONSIBILITY_BINDING_INVALID');
  const candidate = value as {responsibilityId?: unknown; aggregateVersion?: unknown; evidenceRevision?: unknown};
  if (typeof candidate.responsibilityId !== 'string' || !candidate.responsibilityId.trim() ||
      !Number.isInteger(candidate.aggregateVersion) || Number(candidate.aggregateVersion) < 1 ||
      !Number.isInteger(candidate.evidenceRevision) || Number(candidate.evidenceRevision) < 0) {
    throw new CommunicationInputError('RESPONSIBILITY_BINDING_INVALID');
  }
  return {
    responsibilityId: candidate.responsibilityId.trim(),
    aggregateVersion: candidate.aggregateVersion as number,
    evidenceRevision: candidate.evidenceRevision as number
  };
}


export async function parseCommunicationRequest(request: Request): Promise<Record<string, unknown>> {
  try {
    return parseCommunicationBody(await request.json());
  } catch (error) {
    if (error instanceof CommunicationInputError) throw error;
    throw new CommunicationInputError('INVALID_JSON_BODY');
  }
}
