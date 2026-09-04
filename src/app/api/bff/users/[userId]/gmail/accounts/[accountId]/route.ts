import {getOwnedAppSession} from '@/server/auth/session';
import {gmailErrorResponse} from '@/server/gmail/http';
import {createGmailRuntime} from '@/server/gmail/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {params: Promise<{userId: string; accountId: string}>};

export async function DELETE(request: Request, context: RouteContext) {
  const {userId, accountId} = await context.params;
  try {
    await getOwnedAppSession(request.headers, userId);
    await createGmailRuntime().credentials.disconnect(userId, accountId);
    return new Response(null, {status: 204, headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    const response = gmailErrorResponse(error);
    if (response) return response;
    throw error;
  }
}
