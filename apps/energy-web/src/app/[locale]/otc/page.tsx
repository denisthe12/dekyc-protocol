'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { fetchOtcListings, fillOtcListing, OtcListingItem } from '@/lib/api/otc';
import { fetchEnergyMe } from '@/lib/api/energy';
import { loadEnergySession } from '@/lib/session';
import { formatKzte } from '@/lib/formatters';
import { ConfirmActionDialog } from '@/components/security/confirm-action-dialog';

function explorerTxUrl(signature: string | null): string | null {
  if (!signature) {
    return null;
  }

  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

const payoutModeStyles: Record<string, string> = {
  KZTE: 'text-emerald-400',
  ENERGY_POINTS: 'text-amber-400',
};

export default function OtcPage() {
  const locale = useLocale();
  const t = useTranslations('OtcPage');
  const common = useTranslations('Common');

  const [listings, setListings] = useState<OtcListingItem[]>([]);
  const [energyUserId, setEnergyUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyingListingId, setBuyingListingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmListingId, setConfirmListingId] = useState<string | null>(null);

  useEffect(() => {
    void loadPage();
  }, []);

  async function loadPage(): Promise<void> {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const session = loadEnergySession();
      if (session) {
        const me = await fetchEnergyMe(session.accessToken);
        setEnergyUserId(me.id);
      }

      const data = await fetchOtcListings();
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load OTC page');
      setListings([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleBuy(listingId: string): Promise<void> {
    if (!energyUserId) {
      setError('Energy user session not found');
      return;
    }

    try {
      setBuyingListingId(listingId);
      setError(null);
      setSuccessMessage(null);

      await fillOtcListing({
        energyUserId,
        listingId,
      });

      setSuccessMessage(t('buySuccess'));
      await loadPage();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('buyError'));
    } finally {
      setBuyingListingId(null);
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

        {error ? (
          <div className="rounded-3xl border border-red-900 bg-red-950/40 p-6 text-red-300">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-3xl border border-emerald-900 bg-emerald-950/40 p-6 text-emerald-300">
            {successMessage}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-400">
            {common('loading')}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-400">
            {t('empty')}
          </div>
        ) : (
          <div className="grid gap-6">
            {listings.map((listing) => {
              const createTxUrl = explorerTxUrl(listing.createListingTx);

              return (
                <article
                  key={listing.id}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <div className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                        Asset {listing.assetId}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold">
                          OTC Listing #{listing.listingId}
                        </h2>

                        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs font-medium text-zinc-300">
                          <span className="text-zinc-500">{t('bucket')}</span>
                          <span className={`${payoutModeStyles[listing.payoutMode]}`}>{listing.payoutMode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="text-xs text-zinc-500">{t('shareAmount')}</div>
                        <div className="mt-2 text-sm text-zinc-300">
                          {listing.shareAmount}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="text-xs text-zinc-500">{t('pricePerShare')}</div>
                        <div className="mt-2 text-sm text-zinc-300">
                          {formatKzte(listing.pricePerShareKzte)} KZTE
                        </div>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="text-xs text-zinc-500">{t('totalPrice')}</div>
                        <div className="mt-2 text-sm text-zinc-300">
                          {formatKzte(listing.totalPriceKzte)} KZTE
                        </div>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="text-xs text-zinc-500">{t('seller')}</div>
                        <div className="mt-2 break-all text-xs text-zinc-300">
                          {listing.sellerWalletAddress}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="text-xs text-zinc-500">{t('listingPda')}</div>
                        <div className="mt-2 break-all text-xs text-zinc-300">
                          {listing.listingPda}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="text-xs text-zinc-500">{t('escrow')}</div>
                        <div className="mt-2 break-all text-xs text-zinc-300">
                          {listing.escrowShareAccount}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {(() => {
                        const isOwnListing = energyUserId === listing.sellerEnergyUserId;
                        const isBuying = buyingListingId === listing.listingId;

                        return (
                          <>
                            <button
                              type="button"
                              onClick={() => setConfirmListingId(listing.listingId)}
                              disabled={isBuying || isOwnListing}
                              className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isBuying
                                ? t('buying')
                                : isOwnListing
                                  ? t('ownListing')
                                  : t('buy')}
                            </button>

                            <ConfirmActionDialog
                              open={confirmListingId === listing.listingId}
                              onClose={() => setConfirmListingId(null)}
                              onConfirm={async () => {
                                await handleBuy(listing.listingId);
                              }}
                              title="Confirm OTC purchase"
                            />
                          </>
                        );
                      })()}

                      {createTxUrl ? (
                        <a
                          href={createTxUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                        >
                          {t('createListingTx')}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}