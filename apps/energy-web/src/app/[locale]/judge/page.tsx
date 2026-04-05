import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { fetchJudgeSummary } from '@/lib/api/judge';
import { formatKzte } from '@/lib/formatters';
import { JudgeEpochControls } from '@/components/judge/judge-epoch-controls';

type JudgePageProps = {
  params: Promise<{ locale: string }>;
};

function explorerAddressUrl(address: string | null): string | null {
  if (!address) {
    return null;
  }

  return `https://explorer.solana.com/address/${address}?cluster=devnet`;
}

function explorerTxUrl(signature: string | null): string | null {
  if (!signature) {
    return null;
  }

  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

export default async function JudgePage({ params }: JudgePageProps) {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'JudgePage' });
  const common = await getTranslations({ locale, namespace: 'Common' });

  const summary = await fetchJudgeSummary();

  const programUrl = explorerAddressUrl(summary.solana.tokenizationProgramId);
  const signerUrl = explorerAddressUrl(summary.solana.signerAddress);
  const mintUrl = explorerAddressUrl(summary.kzte.mintAddress);

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)]">
      <div className="mx-auto flex w-full max-w-[1880px] flex-col gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                {t('eyebrow')}
              </div>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                {t('title')}
              </h1>

              <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--muted-foreground)]">
                {t('description')}
              </p>

              <div className="mt-4 text-sm text-[var(--muted-foreground)]">
                {t('generatedAt')}: {new Date(summary.generatedAt).toLocaleString()}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <JudgeEpochControls />

              <Link
                href={`/${locale}`}
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] transition hover:bg-[var(--muted)]/40"
              >
                {common('backHome')}
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">{t('solana')}</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
              <div className="text-xs text-[var(--muted-foreground)]">
                {t('rpc')}
              </div>
              <div className="mt-2 break-all text-xs text-[var(--foreground)]">
                {summary.solana.rpcUrl}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
              <div className="text-xs text-[var(--muted-foreground)]">
                {t('signer')}
              </div>
              <div className="mt-2 break-all text-xs text-[var(--foreground)]">
                {summary.solana.signerAddress}
              </div>

              {signerUrl ? (
                <a
                  href={signerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs text-[var(--muted-foreground)] underline"
                >
                  {t('openExplorer')}
                </a>
              ) : null}
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
              <div className="text-xs text-[var(--muted-foreground)]">
                {t('programId')}
              </div>
              <div className="mt-2 break-all text-xs text-[var(--foreground)]">
                {summary.solana.tokenizationProgramId}
              </div>

              {programUrl ? (
                <a
                  href={programUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs text-[var(--muted-foreground)] underline"
                >
                  {t('openExplorer')}
                </a>
              ) : null}
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
              <div className="text-xs text-[var(--muted-foreground)]">
                {t('mint')}
              </div>
              <div className="mt-2 break-all text-xs text-[var(--foreground)]">
                {summary.kzte.mintAddress ?? '—'}
              </div>
              <div className="mt-2 text-xs text-[var(--muted-foreground)]">
                {t('supply')}: {summary.kzte.supply ?? '—'}
              </div>

              {mintUrl ? (
                <a
                  href={mintUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs text-[var(--muted-foreground)] underline"
                >
                  {t('openExplorer')}
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">{t('users')}</h2>

          {summary.users.length === 0 ? (
            <div className="mt-6 text-[var(--muted-foreground)]">{t('empty')}</div>
          ) : (
            <div className="mt-6 grid gap-4">
              {summary.users.map((user) => (
                <article
                  key={user.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-6"
                >
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('userId')}
                      </div>
                      <div className="mt-2 break-all text-xs text-[var(--foreground)]">
                        {user.id}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('name')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {user.fullName ?? '—'}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('email')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {user.email ?? '—'}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('wallet')}
                      </div>
                      <div className="mt-2 break-all text-xs text-[var(--foreground)]">
                        {user.wallet?.custodialWalletAddress ?? '—'}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">{t('assets')}</h2>

          {summary.assets.length === 0 ? (
            <div className="mt-6 text-[var(--muted-foreground)]">{t('empty')}</div>
          ) : (
            <div className="mt-6 grid gap-6">
              {summary.assets.map((asset) => (
                <article
                  key={asset.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-6"
                >
                  <div className="text-xl font-semibold">{asset.title}</div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.isArray(
                      (asset.metadataJson as { supportedPayoutModes?: string[] } | null)
                        ?.supportedPayoutModes,
                    )
                      ? (
                          (asset.metadataJson as { supportedPayoutModes?: string[] })
                            .supportedPayoutModes ?? []
                        ).map((mode) => (
                          <div
                            key={mode}
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)]/40 px-3 py-1 text-xs font-medium text-[var(--foreground)]"
                          >
                            <span className="text-[var(--muted-foreground)]">
                              {t('supportedMode')}
                            </span>
                            <span
                              className={
                                mode === 'ENERGY_POINTS'
                                  ? 'text-yellow-500'
                                  : 'text-green-600 dark:text-green-400'
                              }
                            >
                              {mode}
                            </span>
                          </div>
                        ))
                      : null}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('assetId')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {asset.assetId}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('sharesLabel')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {asset.totalShares}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('price')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {formatKzte(asset.pricePerShareKzte)} KZTE
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('status')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {asset.status}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('metadataHash')}
                      </div>
                      <div className="mt-2 break-all text-xs text-[var(--foreground)]">
                        {asset.metadataUriHash}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('canonicalJson')}
                      </div>
                      <pre className="mt-2 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--background)]/40 p-3 text-xs text-[var(--foreground)]">
                        {asset.metadataCanonicalJson}
                      </pre>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {explorerTxUrl(asset.createAssetTx) ? (
                      <a
                        href={explorerTxUrl(asset.createAssetTx)!}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:opacity-90"
                      >
                        {t('createAssetTx')}
                      </a>
                    ) : null}

                    {explorerTxUrl(asset.issueSharesTx) ? (
                      <a
                        href={explorerTxUrl(asset.issueSharesTx)!}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] transition hover:bg-[var(--muted)]/40"
                      >
                        {t('issueSharesTx')}
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">{t('positions')}</h2>

          {summary.positions.length === 0 ? (
            <div className="mt-6 text-[var(--muted-foreground)]">{t('empty')}</div>
          ) : (
            <div className="mt-6 grid gap-4">
              {summary.positions.map((position) => (
                <article
                  key={position.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-6"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-sm font-semibold">
                      Asset {position.assetId}
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)]/40 px-3 py-1 text-xs font-medium text-[var(--foreground)]">
                      <span className="text-[var(--muted-foreground)]">
                        {t('bucket')}
                      </span>
                      <span
                        className={
                          position.payoutMode === 'ENERGY_POINTS'
                            ? 'text-yellow-500'
                            : 'text-green-600 dark:text-green-400'
                        }
                      >
                        {position.payoutMode}
                      </span>
                    </div>

                    <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--background)]/20 px-3 py-1 text-xs text-[var(--muted-foreground)]">
                      {position.status}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('shares')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {position.totalSharesPurchased}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('spent')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {formatKzte(position.totalKzteSpent)} KZTE
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('averagePrice')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {formatKzte(position.averagePricePerShare)} KZTE
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('shareAccount')}
                      </div>
                      <div className="mt-2 break-all text-xs text-[var(--foreground)]">
                        {position.buyerShareAccount}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">{t('otc')}</h2>

          {summary.otcListings.length === 0 ? (
            <div className="mt-6 text-[var(--muted-foreground)]">{t('empty')}</div>
          ) : (
            <div className="mt-6 grid gap-4">
              {summary.otcListings.map((listing) => (
                <article
                  key={listing.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-6"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-sm font-semibold">
                      Listing {listing.listingId}
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)]/40 px-3 py-1 text-xs font-medium text-[var(--foreground)]">
                      <span className="text-[var(--muted-foreground)]">
                        {t('bucket')}
                      </span>
                      <span
                        className={
                          listing.payoutMode === 'ENERGY_POINTS'
                            ? 'text-yellow-500'
                            : 'text-green-600 dark:text-green-400'
                        }
                      >
                        {listing.payoutMode}
                      </span>
                    </div>

                    <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--background)]/20 px-3 py-1 text-xs text-[var(--muted-foreground)]">
                      {listing.status}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('assetId')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {listing.assetId}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('shares')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {listing.shareAmount}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('price')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {formatKzte(listing.pricePerShareKzte)} KZTE
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('totalAmount')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {formatKzte(listing.totalPriceKzte)} KZTE
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('listingPda')}
                      </div>
                      <div className="mt-2 break-all text-xs text-[var(--foreground)]">
                        {listing.listingPda}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('escrowShareAccount')}
                      </div>
                      <div className="mt-2 break-all text-xs text-[var(--foreground)]">
                        {listing.escrowShareAccount}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('sellerWallet')}
                      </div>
                      <div className="mt-2 break-all text-xs text-[var(--foreground)]">
                        {listing.sellerWalletAddress}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('sellerShareAccount')}
                      </div>
                      <div className="mt-2 break-all text-xs text-[var(--foreground)]">
                        {listing.sellerShareAccount}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('sellerKzteAccount')}
                      </div>
                      <div className="mt-2 break-all text-xs text-[var(--foreground)]">
                        {listing.sellerKzteAccount}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('shareMint')}
                      </div>
                      <div className="mt-2 break-all text-xs text-[var(--foreground)]">
                        {listing.shareMintAddress}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {explorerTxUrl(listing.createListingTx) ? (
                      <a
                        href={explorerTxUrl(listing.createListingTx)!}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:opacity-90"
                      >
                        {t('createListingTx')}
                      </a>
                    ) : null}

                    {explorerTxUrl(listing.fillListingTx) ? (
                      <a
                        href={explorerTxUrl(listing.fillListingTx)!}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] transition hover:bg-[var(--muted)]/40"
                      >
                        {t('fillListingTx')}
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">{t('epochs')}</h2>

          {summary.epochs.length === 0 ? (
            <div className="mt-6 text-[var(--muted-foreground)]">{t('empty')}</div>
          ) : (
            <div className="mt-6 grid gap-4">
              {summary.epochs.map((epoch) => (
                <article
                  key={epoch.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-6"
                >
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('epoch')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {epoch.epochIndex}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('amountPerShare')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {formatKzte(epoch.amountPerShareKzte)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('totalAmount')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {formatKzte(epoch.totalAmountKzte)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('snapshot')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {epoch.totalSharesSnapshot}
                      </div>
                    </div>
                  </div>

                  {explorerTxUrl(epoch.createEpochTx) ? (
                    <div className="mt-4">
                      <a
                        href={explorerTxUrl(epoch.createEpochTx)!}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] transition hover:bg-[var(--muted)]/40"
                      >
                        {t('createEpochTx')}
                      </a>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">{t('claims')}</h2>

          {summary.claims.length === 0 ? (
            <div className="mt-6 text-[var(--muted-foreground)]">{t('empty')}</div>
          ) : (
            <div className="mt-6 grid gap-4">
              {summary.claims.map((claim) => (
                <article
                  key={claim.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-6"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-sm font-semibold">
                      {t('claimUser')} {claim.energyUserId}
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)]/40 px-3 py-1 text-xs font-medium text-[var(--foreground)]">
                      <span className="text-[var(--muted-foreground)]">
                        {t('bucket')}
                      </span>
                      <span
                        className={
                          claim.payoutMode === 'ENERGY_POINTS'
                            ? 'text-yellow-500'
                            : 'text-green-600 dark:text-green-400'
                        }
                      >
                        {claim.payoutMode}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('claimAmountKzte')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {formatKzte(claim.claimedAmountKzte)} KZTE
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('claimAmountEnergyPoints')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {formatKzte(claim.claimedAmountEnergyPoints)} EP
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('claimReceipt')}
                      </div>
                      <div className="mt-2 break-all text-xs text-[var(--foreground)]">
                        {claim.claimReceiptPda}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {t('created')}
                      </div>
                      <div className="mt-2 text-sm text-[var(--foreground)]">
                        {new Date(claim.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {explorerTxUrl(claim.claimTx) ? (
                      <a
                        href={explorerTxUrl(claim.claimTx)!}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:opacity-90"
                      >
                        {t('claimTx')}
                      </a>
                    ) : null}

                    {explorerTxUrl(claim.energyPointsMintTx) ? (
                      <a
                        href={explorerTxUrl(claim.energyPointsMintTx)!}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] transition hover:bg-[var(--muted)]/40"
                      >
                        {t('energyPointsMintTx')}
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}