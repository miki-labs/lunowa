import {sessionAccessResponse} from '@/server/auth/session';

import {SourceAccessError} from '@/server/db/repositories/source';

export function sourceErrorResponse(error: unknown): Response | null {
  const sessionResponse = sessionAccessResponse(error);
  if (sessionResponse) return sessionResponse;
  if (error instanceof SourceAccessError) {
    return Response.json(
      {error: error.code},
      {status: 404, headers: {'Cache-Control': 'no-store'}}
    );
  }
  if (error instanceof Error && /^SOURCE_(INVALID_LIMIT|QUERY_TOO_LONG|INVALID_FROM_DATE|INVALID_TO_DATE)$/.test(error.message)) {
    return Response.json(
      {error: error.message},
      {status: 400, headers: {'Cache-Control': 'no-store'}}
    );
  }
  return null;
}

export function parseSourceLimit(value: string | null): number | undefined {
  if (value === null || value === '') return undefined;
  const limit = Number(value);
  if (!Number.isSafeInteger(limit) || limit < 1) throw new Error('SOURCE_INVALID_LIMIT');
  return limit;
}

export function parseSourceDate(value: string | null, name: 'from' | 'to'): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`SOURCE_INVALID_${name.toUpperCase()}_DATE`);
  return date;
}
