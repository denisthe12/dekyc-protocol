'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { fetchPortfolio, PortfolioPosition } from '@/lib/api/portfolio';
import { fetchEnergyMe } from '@/lib/api/energy';
import { loadEnergySession } from '@/lib/session';
import { formatKzte } from '@/lib/formatters';
import { SellSharesDialog } from '@/components/energy/sell-shares-dialog';

function explorerTxUrl(signature: string | null): string | null {
  if (!signature) {
    return null;
  }

  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

export default function PortfolioPage() {
  const locale = useLocale();
  const t = useTranslations('PortfolioPage');
  const common = useTranslations('Common');

  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellTarget, setSellTarget] = useState<{
    assetId: string;
    payoutMode: 'KZTE' | 'ENERGY_POINTS';
    maxShares: number;
  } | null>(null);

  useEffect(() => {
    void loadPortfolio();
  }, []);

  async function loadPortfolio(): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const session = loadEnergySession();
      if (!session) {
        setPositions([]);
        return;
      }

      const me = await fetchEnergyMe(session.accessToken);
      const data = await fetchPortfolio(me.id);
      setPositions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Portfolio loading failed');
      setPositions([]);
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
        ) : positions.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-400">
            {t('empty')}
          </div>
        ) : (
          <div className="grid gap-6">
            {positions.map((position) => {
              const txUrl = explorerTxUrl(position.lastPurchaseTx);

              return (
                <article
                  key={position.id}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
                >
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <div className="text-xs text-zinc-500">{t('assetId')}</div>
                      <div className="mt-2 text-sm text-zinc-300">{position.assetId}</div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <div className="text-xs text-zinc-500">Bucket</div>
                      <div className="mt-2 text-sm text-zinc-300">{position.payoutMode}</div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <div className="text-xs text-zinc-500">{t('shares')}</div>
                      <div className="mt-2 text-sm text-zinc-300">
                        {position.totalSharesPurchased}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <div className="text-xs text-zinc-500">{t('spent')}</div>
                      <div className="mt-2 text-sm text-zinc-300">
                        {formatKzte(position.totalKzteSpent)} KZTE
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <div className="text-xs text-zinc-500">{t('averagePrice')}</div>
                      <div className="mt-2 text-sm text-zinc-300">
                        {formatKzte(position.averagePricePerShare)} KZTE
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <div className="text-xs text-zinc-500">{t('assetPda')}</div>
                      <div className="mt-2 break-all text-xs text-zinc-300">
                        {position.assetPda}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <div className="text-xs text-zinc-500">{t('shareMint')}</div>
                      <div className="mt-2 break-all text-xs text-zinc-300">
                        {position.shareMintAddress}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <div className="text-xs text-zinc-500">
                        {t('buyerShareAccount')}
                      </div>
                      <div className="mt-2 break-all text-xs text-zinc-300">
                        {position.buyerShareAccount}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setSellTarget({
                          assetId: position.assetId,
                          payoutMode: position.payoutMode,
                          maxShares: position.totalSharesPurchased,
                        })
                      }
                      className="rounded-2xl bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                    >
                      Sell via OTC
                    </button>

                    {txUrl ? (
                      <a
                        href={txUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-zinc-700 px-5 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                      >
                        {t('lastPurchaseTx')}
                      </a>
                    ) : null}
                  </div>
                </article>
              );
              
            })}
            <SellSharesDialog
              open={sellTarget !== null}
              onClose={() => setSellTarget(null)}
              assetId={sellTarget?.assetId ?? ''}
              payoutMode={sellTarget?.payoutMode ?? 'KZTE'}
              maxShares={sellTarget?.maxShares ?? 0}
              onSuccess={async () => {
                await loadPortfolio();
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}