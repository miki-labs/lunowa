import {randomUUID} from 'node:crypto';

import {getOwnedAppSession} from '@/server/auth/session';
import {gmailErrorResponse} from '@/server/gmail/http';
import {disconnectGmailAccount} from '@/server/integrity/disconnect';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {params: Promise<{userId: string; accountId: string}>};

export async function DELETE(request: Request, context: RouteContext) {
  const {userId, accountId} = await context.params;
  try {
    await getOwnedAppSession(request.headers, userId);
    await disconnectGmailAccount({
      userId,
      connectedAccountId: accountId,
      requestKey: `gmail-disconnect:${randomUUID()}`
    });
    return new Response(null, {status: 204, headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    const response = gmailErrorResponse(error);
    if (response) return response;
    throw error;
  }
}
