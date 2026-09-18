'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useCallback, useEffect, useRef, useState} from 'react';

import {authClient} from '@/lib/auth-client';
import {beginGoogleSignIn} from '@/lib/google-sign-in';
import {LunowaShell} from './lunowa-shell';
import {SessionEntry, type EntryReason} from './auth-entry';
export {SessionEntry} from './auth-entry';

type ClientSession = NonNullable<Awaited<ReturnType<typeof authClient.getSession>>['data']>;
type SessionState = {
  status: 'checking' | 'signed-out' | 'authenticated' | 'session-expired' | 'auth-error';
  data?: ClientSession;
  signedOutConfirmed?: boolean;
};

export function AuthBoundary({oauthCallback, mailboxCallback}: {oauthCallback?: 'returned' | 'failed'; mailboxCallback?: 'syncing' | 'cancelled'}) {
  const locale = useLocale();
  const t = useTranslations('Auth');
  const [sessionState, setSessionState] = useState<SessionState>({status: 'checking'});
  const [signingOut, setSigningOut] = useState(false);
  const [sessionActionError, setSessionActionError] = useState('');
  const checkGeneration = useRef(0);
  const authMutationPending = useRef(false);

  const checkSession = useCallback(async () => {
    if (authMutationPending.current) return;
    const generation = ++checkGeneration.current;
    try {
      const result = await authClient.getSession({
        query: {disableCookieCache: true, disableRefresh: true}
      });
      if (generation !== checkGeneration.current || authMutationPending.current) return;
      if (result.error) {
        setSessionState((current) => ({status: 'auth-error', data: current.data}));
      } else if (result.data) {
        setSessionState({status: 'authenticated', data: result.data});
        return true;
      } else {
        setSessionState((current) => current.data
          ? {status: 'session-expired', data: current.data}
          : {status: 'signed-out'});
      }
    } catch {
      if (generation !== checkGeneration.current || authMutationPending.current) return;
      setSessionState((current) => ({status: 'auth-error', data: current.data}));
    }
  }, []);

  useEffect(() => {
    if (oauthCallback && window.opener) {
      window.opener.postMessage({type: 'lunowa:auth-callback', failed: oauthCallback === 'failed'}, window.location.origin);
      window.close();
    }
    const initialCheck = window.setTimeout(() => void checkSession(), 0);
    const onFocus = () => void checkSession();
    const onRestore = (event: PageTransitionEvent) => {
      if (event.persisted) { authMutationPending.current = false; void checkSession(); }
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onRestore);
    const interval = window.setInterval(onFocus, 60_000);
    return () => {
      checkGeneration.current += 1;
      window.clearTimeout(initialCheck);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onRestore);
      window.clearInterval(interval);
    };
  }, [checkSession, oauthCallback]);

  const authenticate = async () => {
    if (authMutationPending.current) return;
    setSessionActionError('');
    authMutationPending.current = true;
    checkGeneration.current += 1;
    try {
      await beginGoogleSignIn(locale);
      authMutationPending.current = false;
      if (!await checkSession()) throw new Error('GOOGLE_SESSION_UNAVAILABLE');
    } catch (error) {
      authMutationPending.current = false;
      throw error;
    }
  };

  const signOut = async () => {
    if (authMutationPending.current) return;
    setSigningOut(true);
    setSessionActionError('');
    authMutationPending.current = true;
    checkGeneration.current += 1;
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error('SIGN_OUT_FAILED');
      setSessionState({status: 'signed-out', signedOutConfirmed: true});
    } catch {
      setSessionActionError(t('signOutError'));
    } finally {
      authMutationPending.current = false;
      setSigningOut(false);
    }
  };

  if (sessionState.status === 'checking') {
    return <SessionEntry reason="checking" />;
  }

  const authenticated = sessionState.status === 'authenticated';
  const reason: EntryReason = sessionState.status === 'auth-error'
    ? 'auth-error'
    : sessionState.status === 'session-expired'
      ? 'session-expired'
      : 'signed-out';

  return (
    <>
      {sessionState.data && (
        <div hidden={!authenticated}>
          <LunowaShell
            locale={locale === 'en' ? 'en' : 'ja'}
            key={sessionState.data.user.id}
            appUser={{id: sessionState.data.user.id, name: sessionState.data.user.name, email: sessionState.data.user.email}}
            onSignOut={signOut}
            signingOut={signingOut}
            sessionActionError={sessionActionError}
            mailboxCallback={mailboxCallback}
          />
        </div>
      )}
      {!authenticated && (
        <SessionEntry
          reason={reason}
          preserveWork={Boolean(sessionState.data)}
          signedOutConfirmed={sessionState.signedOutConfirmed}
          oauthError={oauthCallback === 'failed'}
          onAuthenticate={authenticate}
          onRetrySession={checkSession}
        />
      )}
    </>
  );
}
