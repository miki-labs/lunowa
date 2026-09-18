import {timingSafeEqual} from 'node:crypto';

import {sha256} from './crypto';
import {GmailProviderError} from './types';

export const GMAIL_OAUTH_COOKIE_PATH = '/api/providers/gmail/oauth/callback';
const GMAIL_OAUTH_COOKIE_MAX_AGE_SECONDS = 10 * 60;

export function oauthBrowserCookie(state: string): {name: string; value: string} {
  const digest = sha256(state);
  return {name: `lunowa_gmail_oauth_${digest.slice(0, 16)}`, value: digest};
}

export function oauthAuthorizationRedirect(
  authorizationUrl: string,
  state: string,
  secure: boolean
): Response {
  const binding = oauthBrowserCookie(state);
  const attributes = [
    `${binding.name}=${binding.value}`,
    `Path=${GMAIL_OAUTH_COOKIE_PATH}`,
    `Max-Age=${GMAIL_OAUTH_COOKIE_MAX_AGE_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax'
  ];
  if (secure) attributes.push('Secure');

  // Keep the one-time browser binding on the external redirect's wire response.
  // Framework cookie side channels are not guaranteed to survive every worker adapter.
  return new Response(null, {
    status: 302,
    headers: {
      'Cache-Control': 'no-store',
      Location: new URL(authorizationUrl).toString(),
      'Set-Cookie': attributes.join('; ')
    }
  });
}

function cookieValue(header: string | null, name: string): string | undefined {
  return header
    ?.split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function assertOauthBrowserBinding(state: string, cookieHeader: string | null): void {
  const expected = oauthBrowserCookie(state);
  const actual = cookieValue(cookieHeader, expected.name);
  if (!actual || actual.length !== expected.value.length ||
      !timingSafeEqual(Buffer.from(actual), Buffer.from(expected.value))) {
    throw new GmailProviderError(400, 'INVALID_OAUTH_BROWSER_BINDING');
  }
}
