'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { fetchPortfolio, type PortfolioPosition } from '@/lib/api/portfolio';
import { fetchEnergyMe } from '@/lib/api/energy';
import { loadEnergySession } from '@/lib/session';
import { PortfolioPositionCard, type GroupedPortfolioPosition } from '@/components/portfolio/portfolio-position-card';

export default function PortfolioPage() {
  const t = useTranslations('PortfolioPage');
  const common = useTranslations('Common');
  const locale = useLocale();

  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [energyUserId, setEnergyUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPage(): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const session = loadEnergySession();
      if (!session?.accessToken) {
        throw new Error(t('errors.sessionNotFound'));
      }

      const me = await fetchEnergyMe(session.accessToken);
      setEnergyUserId(me.id);

      const portfolio = await fetchPortfolio(me.id);
      setPositions(portfolio);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPage();
  }, []);

  const groupedPositions = useMemo<GroupedPortfolioPosition[]>(() => {
    const map = new Map<string, GroupedPortfolioPosition>();

    for (const position of positions) {
      const existing = map.get(position.assetId);

      if (!existing) {
        map.set(position.assetId, {
          assetId: position.assetId,
          energyAssetId: position.energyAssetId,
          assetPda: position.assetPda,
          shareMintAddress: position.shareMintAddress,
          totalShares: position.totalSharesPurchased,
          totalKzteSpent: position.totalKzteSpent,
          weightedAveragePrice: position.averagePricePerShare,
          lastPurchaseTx: position.lastPurchaseTx,
          status: position.status,
          buckets: {
            KZTE: position.payoutMode === 'KZTE' ? position.totalSharesPurchased : 0,
            ENERGY_POINTS:
              position.payoutMode === 'ENERGY_POINTS'
                ? position.totalSharesPurchased
                : 0,
          },
          bucketMeta: {
            KZTE:
              position.payoutMode === 'KZTE'
                ? {
                    buyerShareAccount: position.buyerShareAccount,
                    shares: position.totalSharesPurchased,
                  }
                : null,
            ENERGY_POINTS:
              position.payoutMode === 'ENERGY_POINTS'
                ? {
                    buyerShareAccount: position.buyerShareAccount,
                    shares: position.totalSharesPurchased,
                  }
                : null,
          },
        });

        continue;
      }

      existing.totalShares += position.totalSharesPurchased;
      existing.totalKzteSpent += position.totalKzteSpent;

      existing.weightedAveragePrice =
        existing.totalShares > 0
          ? Math.round(existing.totalKzteSpent / existing.totalShares)
          : 0;

      if (position.lastPurchaseTx) {
        existing.lastPurchaseTx = position.lastPurchaseTx;
      }

      if (position.payoutMode === 'KZTE') {
        existing.buckets.KZTE += position.totalSharesPurchased;
        existing.bucketMeta.KZTE = {
          buyerShareAccount: position.buyerShareAccount,
          shares: existing.buckets.KZTE,
        };
      } else {
        existing.buckets.ENERGY_POINTS += position.totalSharesPurchased;
        existing.bucketMeta.ENERGY_POINTS = {
          buyerShareAccount: position.buyerShareAccount,
          shares: existing.buckets.ENERGY_POINTS,
        };
      }
    }

    return Array.from(map.values()).sort((a, b) => b.assetId.localeCompare(a.assetId));
  }, [positions]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)]">
      <div className="mx-auto flex w-full max-w-[1880px] flex-col gap-8">
        <section className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.4fr_0.9fr] lg:px-10">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
                {t('eyebrow')}
              </div>

              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight lg:text-5xl">
                {t('title')}
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
                {t('description')}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/otc`}
                  className="rounded-2xl bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
                >
                  {t('goToOtc')}
                </Link>

                <Link
                  href={`/${locale}`}
                  className="rounded-2xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium transition hover:bg-[var(--muted)]/40"
                >
                  {common('backHome')}
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--muted)]/30 p-5">
                <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                  <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    {t('heroMetric1Label')}
                  </div>
                  <div className="mt-5 text-4xl font-semibold leading-none">
                    {groupedPositions.length}
                  </div>
                  <p className="mt-5 max-w-[18rem] text-base leading-7 text-[var(--muted-foreground)]">
                    {t('heroMetric1Description')}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--border)] bg-[var(--muted)]/30 p-5">
                <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                  <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    {t('heroMetric2Label')}
                  </div>
                  <div className="mt-5 text-4xl font-semibold leading-none">
                    {groupedPositions.reduce((sum, item) => sum + item.totalShares, 0)}
                  </div>
                  <p className="mt-5 max-w-[18rem] text-base leading-7 text-[var(--muted-foreground)]">
                    {t('heroMetric2Description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 text-[var(--muted-foreground)] shadow-sm">
            {common('loading')}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-900 bg-red-950/40 p-10 text-red-300 shadow-sm">
            {error}
          </div>
        ) : groupedPositions.length === 0 ? (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 text-center text-[var(--muted-foreground)] shadow-sm">
            {t('empty')}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-2">
            {groupedPositions.map((position) => (
              <PortfolioPositionCard
                key={position.assetId}
                position={position}
                energyUserId={energyUserId ?? ''}
                onSuccess={async () => {
                  await loadPage();
                }}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}