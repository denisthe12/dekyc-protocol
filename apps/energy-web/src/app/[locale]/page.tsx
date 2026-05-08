'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { loadEnergySession, clearEnergySession } from '@/lib/session';
import {
  buildDekycConnectRedirectUri,
  fetchEnergyMe,
  startDekycConnectAuthorization,
} from '@/lib/api/energy';
import { FaceScanModal } from '@/components/auth/face-scan-modal';
import { savePendingDekycConnectSession } from '@/lib/dekyc-connect-session';

type MeState = Awaited<ReturnType<typeof fetchEnergyMe>> | null;

export default function HomePage() {
  const t = useTranslations('HomePage');
  const common = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();

  const [me, setMe] = useState<MeState>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile(): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const session = loadEnergySession();
      if (!session) {
        setMe(null);
        return;
      }

      const data = await fetchEnergyMe(session.accessToken);
      setMe(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.loadProfile'));
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout(): void {
    clearEnergySession();
    router.push(`/${locale}/login`);
  }

  async function handleDekycConnectLogin(): Promise<void> {
    try {
      setConnectLoading(true);
      setError(null);

      const state = `energy-${crypto.randomUUID()}`;
      const nonce = `energy-nonce-${crypto.randomUUID()}`;
      const redirectUri = buildDekycConnectRedirectUri(locale);

      savePendingDekycConnectSession({
        state,
        nonce,
        redirectUri,
        createdAt: Date.now(),
      });

      const authorizationSession = await startDekycConnectAuthorization({
        locale,
        state,
        nonce,
      });

      window.location.href = authorizationSession.platformConsentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.connectLogin'));
    } finally {
      setConnectLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)]">
        <div className="mx-auto max-w-5xl text-sm text-[var(--muted-foreground)]">
          {common('loading')}
        </div>
      </main>
    );
  }

  if (!me) {
    return (
      <>
        <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)]">
          <div className="mx-auto flex max-w-6xl flex-col gap-8">
            <section className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
              <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.35fr_0.95fr] lg:px-10">
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
                    {t('eyebrow')}
                  </div>

                  <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight lg:text-5xl">
                    {t('guestTitle')}
                  </h1>

                  <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
                    {t('guestDescription')}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => void handleDekycConnectLogin()}
                      disabled={connectLoading}
                      className="rounded-2xl bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-[var(--background)] transition hover:opacity-90 disabled:opacity-60"
                    >
                      {connectLoading ? t('startingDekycConnect') : t('loginViaDekycConnect')}
                    </button>

                    <button
                      type="button"
                      onClick={() => setScanOpen(true)}
                      className="rounded-2xl border border-[var(--border)] px-5 py-3 text-sm font-medium transition hover:bg-[var(--muted)]/40"
                    >
                      {t('loginViaDekycLegacy')}
                    </button>

                    <Link
                      href={`/${locale}/assets`}
                      className="rounded-2xl border border-[var(--border)] px-5 py-3 text-sm font-medium transition hover:bg-[var(--muted)]/40"
                    >
                      {t('exploreAssets')}
                    </Link>
                  </div>

                  {error ? (
                    <div className="mt-6 rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                      {error}
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-[var(--border)] bg-[var(--muted)]/30 p-5">
                    <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                      <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                        {t('guestMetric1Label')}
                      </div>
                      <div className="mt-5 text-4xl font-semibold leading-none">
                        DeKYC
                      </div>
                      <p className="mt-5 max-w-[18rem] text-base leading-7 text-[var(--muted-foreground)]">
                        {t('guestMetric1Description')}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-[var(--border)] bg-[var(--muted)]/30 p-5">
                    <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                      <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                        {t('guestMetric2Label')}
                      </div>
                      <div className="mt-5 text-4xl font-semibold leading-none">
                        KZTE
                      </div>
                      <p className="mt-5 max-w-[18rem] text-base leading-7 text-[var(--muted-foreground)]">
                        {t('guestMetric2Description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        <FaceScanModal
          open={scanOpen}
          onClose={() => setScanOpen(false)}
          onComplete={() => {
            setScanOpen(false);
            router.push(`/${locale}/login?scanned=1`);
          }}
        />
      </>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                {t('eyebrow')}
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                {t('authTitle')}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
                {t('authDescription')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm transition hover:bg-[var(--muted)]/40"
            >
              {t('logout')}
            </button>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="text-sm text-[var(--muted-foreground)]">
              {t('user')}
            </div>
            <div className="mt-2 text-xl font-semibold">
              {me.fullName ?? t('nameMissing')}
            </div>
            <div className="mt-2 text-sm text-[var(--muted-foreground)]">
              {t('email')}: {me.email ?? t('notProvided')}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="text-sm text-[var(--muted-foreground)]">IIN</div>
            <div className="mt-2 break-all text-sm text-[var(--foreground)]">
              {me.profile?.iin ?? t('notProvided')}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="text-sm text-[var(--muted-foreground)]">
              {t('verification')}
            </div>
            <div className="mt-2 text-sm text-[var(--foreground)]">
              verified: {String(me.profile?.verified ?? false)}
            </div>
            <div className="mt-1 text-sm text-[var(--foreground)]">
              age18Plus: {String(me.profile?.age18Plus ?? false)}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="text-sm text-[var(--muted-foreground)]">
              {t('role')}
            </div>
            <div className="mt-2 text-lg font-semibold">{me.role}</div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="text-sm text-[var(--muted-foreground)]">
              {t('custodialAddress')}
            </div>
            <div className="mt-3 break-all text-sm text-[var(--foreground)]">
              {me.wallet?.custodialWalletAddress ?? t('notCreated')}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="text-sm text-[var(--muted-foreground)]">
              {t('kzteAccount')}
            </div>
            <div className="mt-3 break-all text-sm text-[var(--foreground)]">
              {me.wallet?.kzteTokenAccountAddress ?? t('notCreated')}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="text-sm text-[var(--muted-foreground)]">
              {t('walletStatus')}
            </div>
            <div className="mt-2 text-lg font-semibold">
              {me.wallet?.walletStatus ?? 'UNKNOWN'}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="text-sm text-[var(--muted-foreground)]">
              {t('initialAirdrop')}
            </div>
            <div className="mt-2 text-lg font-semibold">
              {String(me.wallet?.initialKzteAirdropped ?? false)}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="text-sm text-[var(--muted-foreground)]">
              {t('airdropTx')}
            </div>
            <div className="mt-3 break-all text-xs text-[var(--foreground)]">
              {me.wallet?.initialKzteAirdropTx ?? t('notYet')}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}