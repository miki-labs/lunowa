import {getOwnedAppSession} from '@/server/auth/session';
import {CommunicationRepository} from '@/server/db/repositories/communication';
import {communicationErrorResponse, optionalString, parseReplyMode, requiredString} from '@/server/communication/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {params: Promise<{userId: string}>};

export async function GET(request: Request, context: RouteContext) {
  const {userId} = await context.params;
  try {
    await getOwnedAppSession(request.headers, userId);
    const query = new URL(request.url).searchParams;
    const result = await new CommunicationRepository().getReplyContext({
      userId,
      connectedAccountId: requiredString({connectedAccountId: query.get('connectedAccountId')}, 'connectedAccountId'),
      conversationId: requiredString({conversationId: query.get('conversationId')}, 'conversationId'),
      inReplyToMessageId: optionalString({inReplyToMessageId: query.get('inReplyToMessageId')}, 'inReplyToMessageId'),
      mode: parseReplyMode(query.get('mode') ?? 'REPLY')
    });
    return Response.json(result, {headers: {'Cache-Control': 'private, no-store'}});
  } catch (error) {
    const response = communicationErrorResponse(error);
    if (response) return response;
    throw error;
  }
}
