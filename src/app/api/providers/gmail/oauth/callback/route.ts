import {gmailErrorResponse} from '@/server/gmail/http';
import {assertOauthBrowserBinding} from '@/server/gmail/oauth-browser-binding';
import {createGmailRuntime} from '@/server/gmail/runtime';
import {GmailProviderError} from '@/server/gmail/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const state = url.searchParams.get('state');
    const code = url.searchParams.get('code');
    if (url.searchParams.has('error')) throw new GmailProviderError(400, 'OAUTH_DENIED');
    if (!state || !code) throw new GmailProviderError(400, 'INVALID_OAUTH_CALLBACK');
    assertOauthBrowserBinding(state, request.headers.get('cookie'));
    const result = await createGmailRuntime().authorization.completeAuthorization({
      state,
      code
    });
    const destination = new URL(result.returnPath, process.env.BETTER_AUTH_URL);
    destination.searchParams.set('gmail', 'syncing');
    destination.searchParams.set('account', result.connectedAccountId);
    return Response.redirect(destination, 303);
  } catch (error) {
    const response = gmailErrorResponse(error);
    if (response) return response;
    throw error;
  }
}
