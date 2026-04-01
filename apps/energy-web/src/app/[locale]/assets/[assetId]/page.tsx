'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { fetchAssetById } from '@/lib/api/asset-detail';
import { fetchEpochs, fetchClaims, claimPayout, RevenueEpochItem, PayoutClaimItem } from '@/lib/api/payouts';
import { fetchEnergyMe } from '@/lib/api/energy';
import { loadEnergySession } from '@/lib/session';
import { EnergyAssetListItem } from '@/lib/api/assets';
import { formatKzte } from '@/lib/formatters';
import { format } from 'path';
import { BuySharesDialog } from '@/components/energy/buy-shares-dialog';

function explorerTxUrl(signature: string | null): string | null {
  if (!signature) {
    return null;
  }

  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

export default function AssetDetailPage() {
  const locale = useLocale();
  const params = useParams<{ assetId: string }>();
  const assetId = String(params.assetId);

  const t = useTranslations('AssetDetailPage');
  const common = useTranslations('Common');

  const [asset, setAsset] = useState<EnergyAssetListItem | null>(null);
  const [epochs, setEpochs] = useState<RevenueEpochItem[]>([]);
  const [claims, setClaims] = useState<PayoutClaimItem[]>([]);
  const [energyUserId, setEnergyUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingEpochIndex, setClaimingEpochIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [buyOpen, setBuyOpen] = useState(false);

  const claimedEpochIndexes = useMemo(() => {
    return new Set(claims.map((_, index) => claims[index]).map(() => 0));
  }, [claims]);

  useEffect(() => {
    void loadPage();
  }, [assetId]);

  async function loadPage(): Promise<void> {
    try {
      setLoading(true);
      setError(null);
      setClaimMessage(null);

      const session = loadEnergySession();
      if (!session) {
        throw new Error('Energy session not found');
      }

      const me = await fetchEnergyMe(session.accessToken);
      setEnergyUserId(me.id);

      const [assetData, epochData, claimData] = await Promise.all([
        fetchAssetById(assetId),
        fetchEpochs(assetId),
        fetchClaims({ energyUserId: me.id, assetId }),
      ]);

      setAsset(assetData);
      setEpochs(epochData);
      setClaims(claimData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim(epochIndex: number): Promise<void> {
    if (!energyUserId) {
      setError('Energy user id not found');
      return;
    }

    try {
      setClaimingEpochIndex(epochIndex);
      setError(null);
      setClaimMessage(null);

      await claimPayout({
        energyUserId,
        assetId,
        epochIndex,
      });

      setClaimMessage(t('claimSuccess'));
      await loadPage();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('claimError'));
    } finally {
      setClaimingEpochIndex(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl text-sm text-zinc-400">
          {common('loading')}
        </div>
      </main>
    );
  }

  if (!asset) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl rounded-3xl border border-red-900 bg-red-950/40 p-8 text-red-300">
          {t('loadError')}
        </div>
      </main>
    );
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
                {asset.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">
                {t('description')}
              </p>
            </div>

            <Link
              href={`/${locale}/assets`}
              className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              {common('backHome')}
            </Link>
          </div>
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-900 bg-red-950/40 p-6 text-red-300">
            {error}
          </div>
        ) : null}

        {claimMessage ? (
          <div className="rounded-3xl border border-emerald-900 bg-emerald-950/40 p-6 text-emerald-300">
            {claimMessage}
          </div>
        ) : null}

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-2xl font-semibold">{t('assetInfo')}</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-500">Asset ID</div>
              <div className="mt-2 text-sm text-zinc-300">{asset.assetId}</div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-500">Price</div>
              <div className="mt-2 text-sm text-zinc-300">
                {formatKzte(asset.pricePerShareKzte)} KZTE
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-500">Total shares</div>
              <div className="mt-2 text-sm text-zinc-300">{asset.totalShares}</div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-500">Share mint</div>
              <div className="mt-2 break-all text-xs text-zinc-300">
                {asset.shareMintAddress}
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setBuyOpen(true)}
              className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Buy shares
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-2xl font-semibold">{t('epochs')}</h2>

          {epochs.length === 0 ? (
            <div className="mt-6 text-zinc-400">{t('emptyEpochs')}</div>
          ) : (
            <div className="mt-6 grid gap-4">
              {epochs.map((epoch) => {
                const createEpochTxUrl = explorerTxUrl(epoch.createEpochTx);
                const alreadyClaimed = claims.some(
                  (claim) => claim.energyRevenueEpochId === epoch.id,
                );

                return (
                  <article
                    key={epoch.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
                  >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <div className="text-xs text-zinc-500">{t('epochIndex')}</div>
                        <div className="mt-2 text-sm text-zinc-300">
                          {epoch.epochIndex}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-zinc-500">{t('amountPerShare')}</div>
                        <div className="mt-2 text-sm text-zinc-300">
                          {formatKzte(epoch.amountPerShareKzte)} KZTE
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-zinc-500">{t('totalAmount')}</div>
                        <div className="mt-2 text-sm text-zinc-300">
                          {formatKzte(epoch.totalAmountKzte)} KZTE
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-zinc-500">{t('sharesSnapshot')}</div>
                        <div className="mt-2 text-sm text-zinc-300">
                          {epoch.totalSharesSnapshot}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={alreadyClaimed || claimingEpochIndex === epoch.epochIndex}
                        onClick={() => void handleClaim(epoch.epochIndex)}
                        className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {claimingEpochIndex === epoch.epochIndex
                          ? t('claiming')
                          : alreadyClaimed
                            ? 'Claimed'
                            : t('claim')}
                      </button>

                      {createEpochTxUrl ? (
                        <a
                          href={createEpochTxUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                        >
                          {t('createEpochTx')}
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-2xl font-semibold">{t('claims')}</h2>

          {claims.length === 0 ? (
            <div className="mt-6 text-zinc-400">{t('emptyClaims')}</div>
          ) : (
            <div className="mt-6 grid gap-4">
              {claims.map((claim) => {
                const claimTxUrl = explorerTxUrl(claim.claimTx);

                return (
                  <article
                    key={claim.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
                  >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <div>
                        <div className="text-xs text-zinc-500">{t('claimedAmount')}</div>
                        <div className="mt-2 text-sm text-zinc-300">
                          {formatKzte(claim.claimedAmountKzte)} KZTE
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-zinc-500">{t('claimReceipt')}</div>
                        <div className="mt-2 break-all text-xs text-zinc-300">
                          {claim.claimReceiptPda}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-zinc-500">Created</div>
                        <div className="mt-2 text-sm text-zinc-300">
                          {new Date(claim.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {claimTxUrl ? (
                      <div className="mt-4">
                        <a
                          href={claimTxUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                        >
                          {t('claimTx')}
                        </a>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
      <BuySharesDialog
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        assetId={asset.assetId}
        pricePerShareKzte={asset.pricePerShareKzte}
        onSuccess={async () => {
          await loadPage();
        }}
      />
    </main>
  );
}