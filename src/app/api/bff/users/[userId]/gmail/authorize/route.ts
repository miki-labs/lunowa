import {getOwnedAppSession, sessionAccessResponse} from '@/server/auth/session';
import {createGmailRuntime} from '@/server/gmail/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {params: Promise<{userId: string}>};

export async function GET(request: Request, context: RouteContext) {
  const {userId} = await context.params;
  try {
    await getOwnedAppSession(request.headers, userId);
    const requestUrl = new URL(request.url);
    const authorizationUrl = await createGmailRuntime().authorization.createAuthorizationUrl(
      userId,
      requestUrl.searchParams.get('returnTo') ?? undefined
    );
    return Response.redirect(authorizationUrl, 302);
  } catch (error) {
    const response = sessionAccessResponse(error);
    if (response) return response;
    throw error;
  }
}
