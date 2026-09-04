'use client';

import {FormEvent, useCallback, useEffect, useRef, useState} from 'react';

import {authClient} from '@/lib/auth-client';
import {LunowaShell} from './lunowa-shell';

type AuthMode = 'sign-in' | 'sign-up';
type EntryReason = 'signed-out' | 'session-expired' | 'auth-error';
type Credentials = {name: string; email: string; password: string};
type ClientSession = NonNullable<Awaited<ReturnType<typeof authClient.getSession>>['data']>;
type SessionState = {
  status: 'checking' | 'signed-out' | 'authenticated' | 'session-expired' | 'auth-error';
  data?: ClientSession;
  signedOutConfirmed?: boolean;
};

export function AuthBoundary() {
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
    const initialCheck = window.setTimeout(() => void checkSession(), 0);
    const onFocus = () => void checkSession();
    window.addEventListener('focus', onFocus);
    const interval = window.setInterval(onFocus, 60_000);
    return () => {
      checkGeneration.current += 1;
      window.clearTimeout(initialCheck);
      window.removeEventListener('focus', onFocus);
      window.clearInterval(interval);
    };
  }, [checkSession]);

  const authenticate = async (mode: AuthMode, credentials: Credentials) => {
    setSessionActionError('');
    authMutationPending.current = true;
    checkGeneration.current += 1;
    try {
      const result = mode === 'sign-in'
        ? await authClient.signIn.email({email: credentials.email, password: credentials.password})
        : await authClient.signUp.email(credentials);

      if (result.error) {
        throw new Error('メールアドレスまたはパスワードを確認してください。');
      }
    } finally {
      authMutationPending.current = false;
    }
    await checkSession();
  };

  const signOut = async () => {
    setSigningOut(true);
    setSessionActionError('');
    authMutationPending.current = true;
    checkGeneration.current += 1;
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error('SIGN_OUT_FAILED');
      setSessionState({status: 'signed-out', signedOutConfirmed: true});
    } catch {
      setSessionActionError('ログアウトできませんでした。セッションは継続しています。');
    } finally {
      authMutationPending.current = false;
      setSigningOut(false);
    }
  };

  if (sessionState.status === 'checking') {
    return <SessionStatus heading="セッションを確認しています" message="Lunowaへのサインイン状態を確認しています。" />;
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
            appUser={{name: sessionState.data.user.name, email: sessionState.data.user.email}}
            onSignOut={signOut}
            signingOut={signingOut}
            sessionActionError={sessionActionError}
          />
        </div>
      )}
      {!authenticated && (
        <SessionEntry
          reason={reason}
          signedOutConfirmed={sessionState.signedOutConfirmed}
          onAuthenticate={authenticate}
          onRetrySession={checkSession}
        />
      )}
    </>
  );
}

export function SessionEntry({reason, signedOutConfirmed = false, onAuthenticate, onRetrySession}: {
  reason: EntryReason;
  signedOutConfirmed?: boolean;
  onAuthenticate: (mode: AuthMode, credentials: Credentials) => Promise<void>;
  onRetrySession?: () => Promise<void>;
}) {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setFormError('');
    const form = new FormData(event.currentTarget);
    try {
      await onAuthenticate(mode, {
        name: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? '')
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '認証できませんでした。もう一度お試しください。');
    } finally {
      setPending(false);
    }
  };

  const heading = reason === 'session-expired'
    ? 'セッションの期限が切れました'
    : reason === 'auth-error'
      ? 'サインイン状態を確認できません'
      : 'Lunowaにサインイン';

  return (
    <main className="session-panel" data-testid={`session-${reason}`}>
      <p className="eyebrow">LUNOWA</p>
      <h1>{heading}</h1>
      {signedOutConfirmed && (
        <p className="session-notice" role="status">この端末からログアウトしました。Lunowaの監視設定は変更されていません。</p>
      )}
      {reason === 'session-expired' && (
        <p className="session-notice" role="status">安全のため、もう一度サインインしてください。メールボックスの接続やサーバー側の監視が停止したことは意味しません。</p>
      )}
      {reason === 'auth-error' && (
        <>
          <p className="session-notice" role="alert">現在、アプリのセッションを確認できません。メールボックスの接続状態や監視状態はここでは変更されていません。</p>
          {onRetrySession && <button className="quiet-button" type="button" onClick={() => void onRetrySession()}>セッションを再確認</button>}
        </>
      )}
      {reason !== 'auth-error' && (
        <>
          <p>Lunowaアプリのアカウントです。メールボックスの接続は、サインイン後に別の操作として行います。</p>
          <form className="auth-form" onSubmit={submit}>
            {mode === 'sign-up' && <label>名前<input name="name" autoComplete="name" required /></label>}
            <label>メールアドレス<input name="email" type="email" autoComplete="email" required /></label>
            <label>パスワード<input name="password" type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} minLength={8} required /></label>
            {formError && <p className="auth-error" role="alert">{formError}</p>}
            <button className="primary-button" disabled={pending} type="submit">
              {pending ? '確認しています' : mode === 'sign-in' ? 'サインインする' : 'アカウントを作成する'}
            </button>
          </form>
          <button
            className="quiet-button"
            disabled={pending}
            type="button"
            onClick={() => {
              setFormError('');
              setMode((current) => current === 'sign-in' ? 'sign-up' : 'sign-in');
            }}
          >
            {mode === 'sign-in' ? '初めての方：アカウントを作成' : 'すでにアカウントがある方：サインイン'}
          </button>
        </>
      )}
    </main>
  );
}

function SessionStatus({heading, message}: {heading: string; message: string}) {
  return <main className="session-panel" role="status"><p className="eyebrow">LUNOWA</p><h1>{heading}</h1><p>{message}</p></main>;
}
