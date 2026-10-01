'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';
import {useEffect, useRef, useState, type ReactNode} from 'react';

import styles from './auth-entry.module.css';

export type EntryReason = 'checking' | 'signed-out' | 'session-expired' | 'auth-error';

function Spinner() {
  return <span className={styles.spinner} aria-hidden="true" />;
}

export function AuthShell({children, allowLanguageChange = true}: {children: ReactNode; allowLanguageChange?: boolean}) {
  const locale = useLocale();
  const t = useTranslations('Auth');
  return (
    <main className={styles.shell}>
      <div className={styles.entry}>
        <section className={styles.card} aria-labelledby="auth-heading">
          <div className={styles.brandRow}>
            <span className={styles.wordmark}>Lunowa</span>
            {allowLanguageChange && <nav className={styles.languages} aria-label={t('language')}>
              <Link href="/ja" lang="ja" hrefLang="ja" aria-current={locale === 'ja' ? 'true' : undefined}>日本語</Link>
              <Link href="/en" lang="en" hrefLang="en" aria-label="English" aria-current={locale === 'en' ? 'true' : undefined}>EN</Link>
            </nav>}
          </div>
          <div className={styles.rule} aria-hidden="true" />
          {children}
          <div className={styles.note}>
            <p className={styles.noteTitle}>{t('mailboxTitle')}</p>
            <p className={styles.noteBody}>{t('mailboxDescription')}</p>
          </div>
        </section>
        <footer className={styles.footer}><span>Lunowa</span><span>{t('footer')}</span></footer>
      </div>
    </main>
  );
}

export function SessionEntry({reason, signedOutConfirmed = false, oauthError = false, preserveWork = false, onAuthenticate, onRetrySession}: {
  reason: EntryReason;
  signedOutConfirmed?: boolean;
  oauthError?: boolean;
  preserveWork?: boolean;
  onAuthenticate?: () => Promise<void>;
  onRetrySession?: () => Promise<unknown>;
}) {
  const t = useTranslations('Auth');
  const [pending, setPending] = useState<'google' | 'session' | null>(null);
  const [failed, setFailed] = useState(false);
  const inFlight = useRef(false);

  // OAuth may leave this document in the browser's back/forward cache.
  useEffect(() => {
    const restore = (event: PageTransitionEvent) => {
      if (event.persisted) { inFlight.current = false; setPending(null); }
    };
    window.addEventListener('pageshow', restore);
    return () => window.removeEventListener('pageshow', restore);
  }, []);

  const run = async (kind: 'google' | 'session') => {
    if (inFlight.current) return;
    const action = kind === 'google' ? onAuthenticate : onRetrySession;
    if (!action) return;
    inFlight.current = true;
    setPending(kind);
    setFailed(false);
    try {
      await action();
      // A verified session replaces this entry; never unlock on initiation alone.
      if (kind === 'session') { inFlight.current = false; setPending(null); }
    } catch {
      inFlight.current = false;
      setPending(null);
      setFailed(true);
    }
  };

  const error = failed || (oauthError && !pending);
  const heading = reason === 'checking' ? 'checkingTitle' : reason === 'auth-error' ? 'sessionErrorTitle' : reason === 'session-expired' ? 'expiredTitle' : 'title';
  const description = reason === 'checking' ? 'checkingDescription' : reason === 'auth-error' ? 'sessionErrorDescription' : reason === 'session-expired' ? 'expiredDescription' : 'description';

  return (
    <AuthShell allowLanguageChange={!preserveWork && !pending}>
      <div data-testid={`session-${reason}`}>
        <h1 className={styles.heading} id="auth-heading">{t(heading)}</h1>
        <p className={styles.intro}>{t(description)}</p>
        {signedOutConfirmed && <p className={styles.notice} role="status">{t('signedOut')}</p>}
        {reason === 'session-expired' && <p className={styles.notice} role="status">{t('expiredNotice')}</p>}
        {reason === 'auth-error' && <p className={`${styles.notice} ${styles.error}`} role="alert">{t('sessionErrorNotice')}</p>}
        {error && reason !== 'auth-error' && <p className={`${styles.notice} ${styles.error}`} role="alert">{t('googleError')}</p>}
        {reason === 'checking' ? (
          <div className={styles.loading} role="status"><Spinner /><span>{t('checking')}</span></div>
        ) : (
          <div className={styles.action}>
            <button
              type="button"
              className={styles.button}
              aria-disabled={Boolean(pending)}
              aria-busy={Boolean(pending)}
              onClick={() => void run(reason === 'auth-error' ? 'session' : 'google')}
            >
              {reason !== 'auth-error' && !pending && <Image src="/brand/google-g.png" width={20} height={20} alt="" />}
              {pending && <Spinner />}
              <span>{t(pending === 'google' ? 'openingGoogle' : pending === 'session' ? 'checking' : reason === 'auth-error' ? 'retrySession' : error ? 'retryGoogle' : 'continueGoogle')}</span>
            </button>
            {pending && <p className={styles.helper} role="status">{t(pending === 'google' ? 'openingGoogle' : 'checking')}</p>}
            {reason !== 'auth-error' && !pending && <p className={styles.helper}>{t('newUser')}</p>}
          </div>
        )}
      </div>
    </AuthShell>
  );
}
