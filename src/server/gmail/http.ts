import {sessionAccessResponse} from '@/server/auth/session';

import {GmailProviderError} from './types';

export function gmailErrorResponse(error: unknown): Response | null {
  const sessionResponse = sessionAccessResponse(error);
  if (sessionResponse) return sessionResponse;
  if (!(error instanceof GmailProviderError)) return null;
  const status = error.status >= 400 && error.status <= 599 ? error.status : 500;
  return Response.json(
    {error: error.code},
    {status, headers: {'Cache-Control': 'no-store'}}
  );
}
