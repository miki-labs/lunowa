import {getOwnedAppSession, sessionAccessResponse} from '@/server/auth/session';
import {GMAIL_OAUTH_COOKIE_PATH, oauthBrowserCookie} from '@/server/gmail/oauth-browser-binding';
import {createGmailRuntime} from '@/server/gmail/runtime';
import {NextResponse} from 'next/server';

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
    const state = new URL(authorizationUrl).searchParams.get('state');
    if (!state) throw new Error('Gmail authorization URL is missing state.');
    const binding = oauthBrowserCookie(state);
    const response = NextResponse.redirect(authorizationUrl, 302);
    response.cookies.set(binding.name, binding.value, {
      httpOnly: true,
      sameSite: 'lax',
      secure: requestUrl.protocol === 'https:',
      path: GMAIL_OAUTH_COOKIE_PATH,
      maxAge: 10 * 60
    });
    return response;
  } catch (error) {
    const response = sessionAccessResponse(error);
    if (response) return response;
    throw error;
  }
}
