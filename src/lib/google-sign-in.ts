'use client';

import {authClient} from './auth-client';

/** Keep the existing document (including safe unsaved work) alive during OAuth. */
export async function beginGoogleSignIn(locale: string): Promise<void> {
  const popup = window.open('about:blank', 'lunowa-google-auth', 'popup,width=520,height=720');
  if (!popup) throw new Error('AUTH_WINDOW_BLOCKED');
  const controller = new AbortController();
  let settled = false;
  let finish: (error?: Error) => void = () => {};
  const completion = new Promise<void>((resolve, reject) => {
    finish = (error) => {
      if (settled) return;
      settled = true;
      if (error) reject(error); else resolve();
    };
  });
  // Attach a rejection handler immediately, even while the start request is pending.
  void completion.catch(() => {});
  const receive = (event: MessageEvent) => {
    if (event.origin !== window.location.origin || event.source !== popup) return;
    if (event.data?.type !== 'lunowa:auth-callback') return;
    finish(event.data.failed ? new Error('GOOGLE_SIGN_IN_FAILED') : undefined);
  };
  window.addEventListener('message', receive);
  const closed = window.setInterval(() => {
    if (popup.closed) finish(new Error('AUTH_WINDOW_CLOSED'));
  }, 500);
  const timeout = window.setTimeout(() => finish(new Error('AUTH_WINDOW_TIMEOUT')), 5 * 60_000);

  try {
    const result = await Promise.race([authClient.signIn.social({
      provider: 'google',
      callbackURL: `/${locale}?auth=returned`,
      errorCallbackURL: `/${locale}?auth=failed`,
      disableRedirect: true,
      fetchOptions: {signal: controller.signal}
    }), completion.then(() => { throw new Error('UNEXPECTED_AUTH_CALLBACK'); })]);
    if (result.error || !result.data?.url) throw new Error('GOOGLE_SIGN_IN_FAILED');
    const destination = new URL(result.data.url);
    if (destination.origin !== 'https://accounts.google.com') throw new Error('INVALID_AUTH_DESTINATION');
    if (popup.closed || settled) throw new Error('AUTH_WINDOW_CLOSED');
    popup.location.replace(destination.href);
    await completion;
  } finally {
    controller.abort();
    settled = true;
    window.removeEventListener('message', receive);
    window.clearInterval(closed);
    window.clearTimeout(timeout);
    if (!popup.closed) popup.close();
  }
}
