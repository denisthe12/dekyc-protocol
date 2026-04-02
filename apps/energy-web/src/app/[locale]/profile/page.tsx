'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { fetchProfile, ProfileResponse } from '@/lib/api/profile';
import { loadEnergySession } from '@/lib/session';
import { formatTokenAmount } from '@/lib/token-format';

function explorerAddressUrl(address: string | null): string | null {
  if (!address) {
    return null;
  }

  return `https://explorer.solana.com/address/${address}?cluster=devnet`;
}

export default function ProfilePage() {
  const t = useTranslations('ProfilePage');
  const common = useTranslations('Common');
  const locale = useLocale();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile(): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const session = loadEnergySession();
      if (!session) {
        throw new Error(t('errors.sessionNotFound'));
      }

      const data = await fetchProfile(session.accessToken);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-zinc-500">
                {t('eyebrow')}
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                {t('title')}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">
                {t('description')}
              </p>
            </div>

            <Link
              href={`/${locale}`}
              className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              {common('backHome')}
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-400">
            {common('loading')}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-900 bg-red-950/40 p-8 text-red-300">
            {error}
          </div>
        ) : !profile ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-400">
            {t('empty')}
          </div>
        ) : (
          <>
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="text-xs text-zinc-500">{t('fullName')}</div>
                  <div className="mt-2 text-sm text-zinc-300">
                    {profile.user.fullName ?? '—'}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="text-xs text-zinc-500">{t('email')}</div>
                  <div className="mt-2 text-sm text-zinc-300">
                    {profile.user.email ?? '—'}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="text-xs text-zinc-500">{t('iin')}</div>
                  <div className="mt-2 text-sm text-zinc-300">
                    {profile.user.iin ?? '—'}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="text-xs text-zinc-500">{t('dekycUserId')}</div>
                  <div className="mt-2 break-all text-xs text-zinc-300">
                    {profile.user.dekycUserId}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="text-2xl font-semibold">{t('balances')}</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <div className="text-xs text-zinc-500">KZTE</div>
                  <div className="mt-3 text-2xl font-semibold text-white">
                    {formatTokenAmount(
                      profile.balances.kzte.amountBaseUnits,
                      profile.balances.kzte.decimals,
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <div className="text-xs text-zinc-500">ENERGY_POINTS</div>
                  <div className="mt-3 text-2xl font-semibold text-white">
                    {formatTokenAmount(
                      profile.balances.energyPoints.amountBaseUnits,
                      profile.balances.energyPoints.decimals,
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="text-2xl font-semibold">{t('wallet')}</h2>

              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="text-xs text-zinc-500">{t('custodialWallet')}</div>
                  <div className="mt-2 break-all text-xs text-zinc-300">
                    {profile.wallet?.custodialWalletAddress ?? '—'}
                  </div>
                  {explorerAddressUrl(profile.wallet?.custodialWalletAddress ?? null) ? (
                    <a
                      href={explorerAddressUrl(profile.wallet?.custodialWalletAddress ?? null)!}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-xs text-zinc-400 underline"
                    >
                      {t('openExplorer')}
                    </a>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <div className="text-xs text-zinc-500">{t('kzteTokenAccount')}</div>
                    <div className="mt-2 break-all text-xs text-zinc-300">
                      {profile.wallet?.kzteTokenAccountAddress ?? '—'}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <div className="text-xs text-zinc-500">{t('energyPointsTokenAccount')}</div>
                    <div className="mt-2 break-all text-xs text-zinc-300">
                      {profile.wallet?.energyPointsTokenAccountAddress ?? '—'}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="text-2xl font-semibold">{t('security')}</h2>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-300">
                <span className="text-zinc-500">{t('actionPassword')}</span>
                <span
                  className={
                    profile.security.actionPasswordIsSet
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }
                >
                  {profile.security.actionPasswordIsSet
                    ? t('configured')
                    : t('notConfigured')}
                </span>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}