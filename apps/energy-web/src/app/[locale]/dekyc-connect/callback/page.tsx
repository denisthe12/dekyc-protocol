'use client';

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { createEnergySessionViaDekycConnect } from '@/lib/api/energy';
import { saveEnergySession } from '@/lib/session';
import {
  clearPendingDekycConnectSession,
  isPendingDekycConnectSessionFresh,
  loadPendingDekycConnectSession,
} from '@/lib/dekyc-connect-session';

export default function DekycConnectCallbackPage() {
  const t = useTranslations('DekycConnectCallbackPage');

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)]">
          <div className="mx-auto max-w-3xl rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
            <div className="text-sm text-[var(--muted-foreground)]">
              {t('loading')}
            </div>
          </div>
        </main>
      }
    >
      <DekycConnectCallbackContent />
    </Suspense>
  );
}

function DekycConnectCallbackContent() {
  const t = useTranslations('DekycConnectCallbackPage');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  const exchangeStartedRef = useRef(false);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string | null>(null);

  const redirectUri = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    return `${window.location.origin}/${locale}/dekyc-connect/callback`;
  }, [locale]);

  const exchangeCode = useCallback(
    async (input: { code: string; redirectUri: string }): Promise<void> => {
      try {
        setStatus('loading');
        setMessage(null);

        const session = await createEnergySessionViaDekycConnect(input);

        saveEnergySession(session);
        clearPendingDekycConnectSession();

        setStatus('success');
        setMessage(t('success'));

        router.replace(`/${locale}`);
      } catch (err) {
        exchangeStartedRef.current = false;
        setStatus('error');
        setMessage(err instanceof Error ? err.message : t('exchangeError'));
      }
    },
    [locale, router, t],
  );

  useEffect(() => {
    if (exchangeStartedRef.current) {
      return;
    }

    if (errorParam) {
      clearPendingDekycConnectSession();
      setStatus('error');
      setMessage(errorDescription || errorParam);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage(t('missingCode'));
      return;
    }

    if (!redirectUri) {
      return;
    }

    const pendingSession = loadPendingDekycConnectSession();

    if (!pendingSession) {
      setStatus('error');
      setMessage(t('missingPendingSession'));
      return;
    }

    if (!isPendingDekycConnectSessionFresh(pendingSession)) {
      clearPendingDekycConnectSession();
      setStatus('error');
      setMessage(t('pendingSessionExpired'));
      return;
    }

    if (!state || pendingSession.state !== state) {
      clearPendingDekycConnectSession();
      setStatus('error');
      setMessage(t('stateMismatch'));
      return;
    }

    if (pendingSession.redirectUri !== redirectUri) {
      clearPendingDekycConnectSession();
      setStatus('error');
      setMessage(t('redirectUriMismatch'));
      return;
    }

    exchangeStartedRef.current = true;

    void exchangeCode({
      code,
      redirectUri: pendingSession.redirectUri,
    });
  }, [code, errorParam, errorDescription, redirectUri, state, t, exchangeCode]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)]">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <section className="rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          <div className="text-xs uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
            {t('eyebrow')}
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            {t('title')}
          </h1>

          <p className="mt-4 text-base leading-7 text-[var(--muted-foreground)]">
            {t('description')}
          </p>

          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-5">
            <div className="text-sm text-[var(--muted-foreground)]">
              {t('statusLabel')}
            </div>

            <div className="mt-2 text-lg font-semibold">
              {status === 'loading'
                ? t('statusLoading')
                : status === 'success'
                  ? t('statusSuccess')
                  : t('statusError')}
            </div>

            {message ? (
              <div className="mt-3 break-words text-sm leading-6 text-[var(--muted-foreground)]">
                {message}
              </div>
            ) : null}

            {state ? (
              <div className="mt-3 break-all text-xs text-[var(--muted-foreground)]">
                state: {state}
              </div>
            ) : null}
          </div>

          {status === 'error' ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${locale}`}
                className="rounded-2xl bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-[var(--background)] transition hover:opacity-90"
              >
                {t('backHome')}
              </Link>

              <Link
                href={`/${locale}/assets`}
                className="rounded-2xl border border-[var(--border)] px-5 py-3 text-sm font-medium transition hover:bg-[var(--muted)]/40"
              >
                {t('openAssets')}
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}