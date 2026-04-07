'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { createEnergySessionViaDekyc } from '@/lib/api/energy';
import { loadEnergySession, saveEnergySession } from '@/lib/session';
import { DEKYC_CLIENT_ID, DEKYC_SERVICE_ID } from '@/lib/config';

export function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('LoginPage');

  const [loginCode, setLoginCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanned = searchParams.get('scanned') === '1';

  useEffect(() => {
    if (!scanned) {
      router.replace(`/${locale}`);
      return;
    }

    const existing = loadEnergySession();
    if (existing) {
      router.replace(`/${locale}`);
    }
  }, [router, scanned, locale]);

  async function handleLogin(): Promise<void> {
    if (!DEKYC_SERVICE_ID) {
      setError(t('errors.serviceIdMissing'));
      return;
    }

    if (!DEKYC_CLIENT_ID) {
      setError(t('errors.clientIdMissing'));
      return;
    }

    if (!loginCode.trim()) {
      setError(t('errors.codeRequired'));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const session = await createEnergySessionViaDekyc({
        biometricMockId: `energy-face-${Date.now()}`,
        loginCode: loginCode.trim(),
      });

      saveEnergySession(session);
      router.push(`/${locale}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.loginFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)]">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          <div className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            DeKYC Energy
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            {t('title')}
          </h1>

          <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
            {t('description')}
          </p>

          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
            {t('biometricCompleted')}
          </div>

          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
            <div className="text-sm text-[var(--muted-foreground)]">
              {t('connectedService')}
            </div>
            <div className="mt-2 text-base font-medium text-[var(--foreground)]">
              DeKYC Energy
            </div>
            <div className="mt-2 break-all text-xs text-[var(--muted-foreground)]">
              serviceId: {DEKYC_SERVICE_ID || t('notSet')}
            </div>
            <div className="mt-1 break-all text-xs text-[var(--muted-foreground)]">
              clientId: {DEKYC_CLIENT_ID || t('notSet')}
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <label className="block">
              <div className="mb-2 text-sm text-[var(--foreground)]">
                {t('loginCode')}
              </div>
              <input
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value)}
                placeholder="DK-..."
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
              />
            </label>

            <button
              type="button"
              onClick={() => void handleLogin()}
              disabled={submitting}
              className="w-full rounded-2xl bg-[var(--foreground)] px-4 py-3 text-sm font-medium text-[var(--background)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? t('loggingIn') : t('loginButton')}
            </button>

            {error ? (
              <div className="rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                {error}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">{t('whatChanged')}</h2>
          <div className="mt-6 space-y-3 text-sm leading-7 text-[var(--muted-foreground)]">
            <p>{t('change1')}</p>
            <p>{t('change2')}</p>
            <p>{t('change3')}</p>
          </div>
        </div>
      </div>
    </main>
  );
}