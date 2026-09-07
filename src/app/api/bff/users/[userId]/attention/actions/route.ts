import {getOwnedAppSession, sessionAccessResponse} from '@/server/auth/session';
import {ResponsibilityRepository} from '@/server/db/repositories/responsibility';
import {TemporalRepository} from '@/server/db/repositories/temporal';
import {
  createDelegateResponsibilityCommand,
  createOperationalOutcomeCorrectionCommand,
  createStopTrackingCommand
} from '@/server/responsibility';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {params: Promise<{userId: string}>};
type Action = 'STOP_TRACKING' | 'RETURN_ATTENTION' | 'DELEGATE' | 'RESOLVE_ADMISSION_REVIEW' | 'CORRECT_OPERATIONAL_OUTCOME';
type Body = Record<string, unknown>;

class ActionError extends Error {
  public constructor(public readonly status: 400 | 404 | 409, message: string) {
    super(message);
  }
}

function bodyText(body: Body, key: string, maxLength = 128): string {
  const value = body[key];
  if (typeof value !== 'string' || !value.trim() || value.length > maxLength) throw new ActionError(400, `${key} is required`);
  return value.trim();
}

function bodyInteger(body: Body, key: string): number {
  const value = body[key];
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) throw new ActionError(400, `${key} must be a non-negative integer`);
  return value;
}

function action(body: Body): Action {
  const value = body.action;
  if (value === 'STOP_TRACKING' || value === 'RETURN_ATTENTION' || value === 'DELEGATE' || value === 'RESOLVE_ADMISSION_REVIEW' || value === 'CORRECT_OPERATIONAL_OUTCOME') return value;
  throw new ActionError(400, 'unsupported attention action');
}

function scope(body: Body) {
  return {
    connectedAccountId: bodyText(body, 'connectedAccountId'),
    responsibilityId: bodyText(body, 'responsibilityId'),
    requestKey: bodyText(body, 'requestKey', 48),
    evidenceRevision: bodyInteger(body, 'evidenceRevision'),
    expectedAggregateVersion: bodyInteger(body, 'expectedAggregateVersion')
  };
}

async function parseBody(request: Request): Promise<Body> {
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('body must be an object');
    return value as Body;
  } catch {
    throw new ActionError(400, 'invalid JSON body');
  }
}

function rejected(reason: string): never {
  throw new ActionError(409, reason);
}

export async function POST(request: Request, context: RouteContext) {
  const {userId} = await context.params;
  try {
    await getOwnedAppSession(request.headers, userId);
    const body = await parseBody(request);
    const selectedAction = action(body);
    const responsibilityRepository = new ResponsibilityRepository();

    if (selectedAction === 'RESOLVE_ADMISSION_REVIEW') {
      const reviewId = bodyText(body, 'admissionReviewId');
      const connectedAccountId = bodyText(body, 'connectedAccountId');
      const evidenceRevision = bodyInteger(body, 'evidenceRevision');
      const expectedAggregateVersion = bodyInteger(body, 'expectedAggregateVersion');
      const requestKey = bodyText(body, 'requestKey', 48);
      if (body.resolution !== 'DO_NOT_TRACK') throw new ActionError(400, 'only DO_NOT_TRACK admission review resolution is supported');
      const resolution = 'DO_NOT_TRACK' as const;
      await responsibilityRepository.resolveAdmissionReview({
        userId,
        reviewId,
        connectedAccountId,
        resolution,
        actorKind: 'TRUSTED_USER',
        evidenceRevision,
        expectedAggregateVersion,
        requestKey
      });
      return Response.json({accepted: true, action: selectedAction, admissionReviewId: reviewId}, {headers: {'Cache-Control': 'no-store'}});
    }

    const selected = scope(body);
    const current = await responsibilityRepository.getResponsibility({userId, ...selected});
    if (!current) throw new ActionError(404, 'Responsibility was not found');

    if (selectedAction === 'RETURN_ATTENTION') {
      if (current.state.attentionMode !== 'DEFERRED') rejected('Return Attention requires a currently deferred Responsibility');
      await new TemporalRepository().returnAttention({userId, ...selected});
    } else {
      const commandInput = {
        state: current.state,
        requestKey: selected.requestKey,
        evidenceRevision: selected.evidenceRevision,
        expectedAggregateVersion: selected.expectedAggregateVersion
      };
      const command = selectedAction === 'STOP_TRACKING'
        ? createStopTrackingCommand(commandInput)
        : selectedAction === 'DELEGATE'
          ? createDelegateResponsibilityCommand(commandInput)
          : createOperationalOutcomeCorrectionCommand({...commandInput, value: bodyText(body, 'value', 1000)});
      const result = await responsibilityRepository.applyTrustedCommand(command);
      if (result.status !== 'APPLIED') rejected(result.reason);
    }

    return Response.json({accepted: true, action: selectedAction, responsibilityId: selected.responsibilityId}, {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    if (error instanceof ActionError) return Response.json({accepted: false, error: error.message}, {status: error.status, headers: {'Cache-Control': 'no-store'}});
    const sessionResponse = sessionAccessResponse(error);
    if (sessionResponse) return sessionResponse;
    if (error instanceof Error && /stale|changed after|current revision|current Responsibility|requires a|requires an|requires active|must be applied|not current/i.test(error.message)) {
      return Response.json({accepted: false, error: error.message}, {status: 409, headers: {'Cache-Control': 'no-store'}});
    }
    throw error;
  }
}
