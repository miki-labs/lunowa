import {getOwnedAppSession} from '@/server/auth/session';
import {SourceRepository} from '@/server/db/repositories/source';

import {parseSourceLimit, sourceErrorResponse} from '@/server/source/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {params: Promise<{userId: string}>};

export async function GET(request: Request, context: RouteContext) {
  const {userId} = await context.params;
  try {
    await getOwnedAppSession(request.headers, userId);
    const url = new URL(request.url);
    const result = await new SourceRepository().listConversations({
      userId,
      connectedAccountId: url.searchParams.get('accountId') ?? undefined,
      limit: parseSourceLimit(url.searchParams.get('limit'))
    });
    return Response.json(result, {headers: {'Cache-Control': 'private, no-store'}});
  } catch (error) {
    const response = sourceErrorResponse(error);
    if (response) return response;
    throw error;
  }
}
