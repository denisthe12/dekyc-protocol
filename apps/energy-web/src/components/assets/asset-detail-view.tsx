'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { AssetDetailResponse } from '@/lib/api/asset-detail';
import { ENERGY_API_BASE_URL } from '@/lib/config';
import { formatKzte } from '@/lib/formatters';

type AssetDetailViewProps = {
  asset: AssetDetailResponse;
};

function explorerTxUrl(signature: string | null): string | null {
  if (!signature) return null;
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

export function AssetDetailView({ asset }: AssetDetailViewProps) {
  const t = useTranslations('AssetDetailPage');
  const common = useTranslations('Common');
  const locale = useLocale();

  const supportedModes =
    (asset.metadataJson as { supportedPayoutModes?: string[] } | null)
      ?.supportedPayoutModes ?? ['KZTE'];

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)]">
      <div className="mx-auto flex w-full max-w-[1880px] flex-col gap-8">
        <section className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="grid gap-8 px-8 py-8 xl:grid-cols-[1.05fr_0.95fr] xl:px-10">
            <div className="relative min-h-[320px] overflow-hidden rounded-3xl">
              <Image
                src={asset.coverImageUrl || '/demo-assets/solar.jpg'}
                alt={asset.title}
                fill
                loading="eager"
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 50vw"
              />
            </div>

            <div className="flex flex-col justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
                    {asset.assetType}
                  </span>

                  <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
                    {asset.status}
                  </span>

                  {supportedModes.map((mode) => (
                    <span
                      key={mode}
                      className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium"
                    >
                      {mode}
                    </span>
                  ))}
                </div>

                <h1 className="mt-5 text-4xl font-semibold tracking-tight xl:text-5xl">
                  {asset.title}
                </h1>

                <p className="mt-3 text-base text-[var(--muted-foreground)]">
                  {asset.location || t('unknownLocation')}
                </p>

                <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                  {asset.description || t('noDescription')}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {asset.accessLevel === 'FULL' ? (
                  <button
                    type="button"
                    className="rounded-2xl bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
                  >
                    {t('buyShares')}
                  </button>
                ) : (
                  <div className="rounded-2xl border border-amber-800 bg-amber-950/30 px-4 py-3 text-sm text-amber-300">
                    {t('restrictedWarning')}
                  </div>
                )}

                <Link
                  href={`/${locale}/assets`}
                  className="rounded-2xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium transition hover:bg-[var(--muted)]/40"
                >
                  {common('backHome')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <MetricCard label={t('totalShares')} value={`${asset.totalShares}`} />
              <MetricCard label={t('soldShares')} value={`${asset.soldShares}`} />
              <MetricCard label={t('remainingShares')} value={`${asset.remainingShares}`} />
              <MetricCard
                label={t('pricePerShare')}
                value={`${formatKzte(asset.pricePerShareKzte, locale === 'en' ? 'en' : 'ru')} KZTE`}
              />
              <MetricCard label={t('investorShare')} value={`${asset.investorBps / 100}%`} />
              <MetricCard label={t('operatorShare')} value={`${asset.operatorBps / 100}%`} />
            </div>

            <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                {t('economics')}
              </div>
              <h2 className="mt-3 text-2xl font-semibold">{t('economicsTitle')}</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
                  <div className="text-sm font-medium">{t('payoutModes')}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {supportedModes.map((mode) => (
                      <span
                        key={mode}
                        className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium"
                      >
                        {mode}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
                  <div className="text-sm font-medium">{t('distribution')}</div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                    {t('distributionText', {
                      investor: asset.investorBps / 100,
                      operator: asset.operatorBps / 100,
                    })}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                {t('proofAndDocs')}
              </div>
              <h2 className="mt-3 text-2xl font-semibold">{t('proofTitle')}</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <HashCard label={t('proofRootHash')} value={asset.proofRootHash} />
                <HashCard label={t('metadataHash')} value={asset.metadataUriHash} />
              </div>

              {asset.accessLevel === 'FULL' && asset.documents?.length ? (
                <div className="mt-6 space-y-3">
                  {asset.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium">{doc.fileName}</div>
                          <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                            {doc.documentType} · {doc.mimeType}
                          </div>
                        </div>

                        <a
                          href={`${ENERGY_API_BASE_URL}${doc.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--muted)]/40"
                        >
                          {t('openDocument')}
                        </a>
                      </div>

                      <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--background)]/60 px-3 py-2 text-xs text-[var(--muted-foreground)]">
                        {doc.sha256Hash}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4 text-sm text-[var(--muted-foreground)]">
                  {asset.accessLevel === 'FULL'
                    ? t('noDocuments')
                    : t('privateDocsHidden')}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                {t('blockchainRefs')}
              </div>
              <h2 className="mt-3 text-2xl font-semibold">{t('blockchainTitle')}</h2>

              <div className="mt-5 space-y-3">
                <RefRow label="Asset PDA" value={asset.assetPda} />
                <RefRow label="Registry PDA" value={asset.registryPda} />
                <RefRow label="Share mint" value={asset.shareMintAddress} />
                <RefRow label="Treasury share" value={asset.treasuryShareAccount} />
                <RefRow label="Treasury KZTE" value={asset.treasuryKzteAccount || '—'} />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {explorerTxUrl(asset.createAssetTx) ? (
                  <a
                    href={explorerTxUrl(asset.createAssetTx)!}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
                  >
                    {t('createTx')}
                  </a>
                ) : null}

                {explorerTxUrl(asset.issueSharesTx) ? (
                  <a
                    href={explorerTxUrl(asset.issueSharesTx)!}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--muted)]/40"
                  >
                    {t('issueSharesTx')}
                  </a>
                ) : null}
              </div>
            </section>

            <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                {t('judgeFriendly')}
              </div>
              <h2 className="mt-3 text-2xl font-semibold">{t('judgeTitle')}</h2>
              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                {t('judgeDescription')}
              </p>

              {asset.latestProofBundle ? (
                <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
                  <div className="text-sm font-medium">
                    {t('bundleVersion')}: {asset.latestProofBundle.bundleVersion}
                  </div>
                  <div className="mt-2 break-all text-xs text-[var(--muted-foreground)]">
                    {asset.latestProofBundle.proofRootHash}
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="text-xs text-center uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </div>
      <div className="mt-4 text-center text-2xl font-semibold">{value}</div>
    </div>
  );
}

function HashCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
      <div className="text-sm font-medium">{label}</div>
      <div className="mt-3 break-all text-xs text-[var(--muted-foreground)]">
        {value}
      </div>
    </div>
  );
}

function RefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </div>
      <div className="mt-2 break-all text-sm text-[var(--foreground)]">
        {value}
      </div>
    </div>
  );
}