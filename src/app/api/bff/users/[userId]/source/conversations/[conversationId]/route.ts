import {getOwnedAppSession} from '@/server/auth/session';
import {SourceRepository} from '@/server/db/repositories/source';

import {sourceErrorResponse} from '@/server/source/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {params: Promise<{userId: string; conversationId: string}>};

export async function GET(request: Request, context: RouteContext) {
  const {userId, conversationId} = await context.params;
  try {
    await getOwnedAppSession(request.headers, userId);
    const url = new URL(request.url);
    const result = await new SourceRepository().getConversation({
      userId,
      conversationId,
      connectedAccountId: url.searchParams.get('accountId') ?? undefined
    });
    if (!result) return Response.json({error: 'CONVERSATION_NOT_FOUND'}, {status: 404, headers: {'Cache-Control': 'no-store'}});
    return Response.json(result, {headers: {'Cache-Control': 'private, no-store'}});
  } catch (error) {
    const response = sourceErrorResponse(error);
    if (response) return response;
    throw error;
  }
}
