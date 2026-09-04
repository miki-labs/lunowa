import {getOwnedAppSession, sessionAccessResponse} from '@/server/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{userId: string}>;
};

export async function GET(request: Request, context: RouteContext) {
  const {userId} = await context.params;

  try {
    const current = await getOwnedAppSession(request.headers, userId);
    return Response.json({
      userId: current.user.id,
      sessionId: current.session.id,
      expiresAt: current.session.expiresAt.toISOString()
    }, {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    const accessResponse = sessionAccessResponse(error);
    if (accessResponse) return accessResponse;
    throw error;
  }
}
