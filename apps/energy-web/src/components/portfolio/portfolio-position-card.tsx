'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { formatKzte } from '@/lib/formatters';
import { useState } from 'react';
import { PortfolioSellDialog } from '@/components/portfolio/portfolio-sell-dialog';

export type GroupedPortfolioPosition = {
  assetId: string;
  energyAssetId: string;
  assetPda: string;
  shareMintAddress: string;
  totalShares: number;
  totalKzteSpent: number;
  weightedAveragePrice: number;
  lastPurchaseTx: string | null;
  status: string;
  buckets: {
    KZTE: number;
    ENERGY_POINTS: number;
  };
  bucketMeta: {
    KZTE: { buyerShareAccount: string; shares: number } | null;
    ENERGY_POINTS: { buyerShareAccount: string; shares: number } | null;
  };
};

type PortfolioPositionCardProps = {
  position: GroupedPortfolioPosition;
  energyUserId: string;
  onSuccess?: () => Promise<void> | void;
};

function explorerTxUrl(signature: string | null): string | null {
  if (!signature) return null;
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

export function PortfolioPositionCard({
  position,
  energyUserId,
  onSuccess,
}: PortfolioPositionCardProps) {
  const t = useTranslations('PortfolioPage');
  const locale = useLocale();
  const [sellOpen, setSellOpen] = useState(false);

  const txUrl = explorerTxUrl(position.lastPurchaseTx);

  return (
    <>
      <article className="flex h-full flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
            {position.status}
          </span>

          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
            Asset {position.assetId}
          </span>
        </div>

        <div className="mt-5">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t('positionTitle', { assetId: position.assetId })}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {t('positionDescription')}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MetricTile label={t('totalShares')} value={`${position.totalShares}`} />
          <MetricTile
            label={t('spent')}
            value={`${formatKzte(position.totalKzteSpent, locale === 'en' ? 'en' : 'ru')} KZTE`}
          />
          <MetricTile
            label={t('averagePrice')}
            value={`${formatKzte(position.weightedAveragePrice, locale === 'en' ? 'en' : 'ru')} KZTE`}
          />
          <MetricTile label={t('shareMint')} value={shortHash(position.shareMintAddress)} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <BucketCard
            title="KZTE"
            shares={position.buckets.KZTE}
            emptyLabel={t('noSharesInBucket')}
          />
          <BucketCard
            title="ENERGY_POINTS"
            shares={position.buckets.ENERGY_POINTS}
            emptyLabel={t('noSharesInBucket')}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSellOpen(true)}
            className="rounded-2xl bg-[var(--foreground)] px-5 py-2 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
          >
            {t('sellViaOtc')}
          </button>

          <Link
            href={`/${locale}/assets/${position.assetId}`}
            className="rounded-2xl border border-[var(--border)] px-5 py-2 text-sm font-medium transition hover:bg-[var(--muted)]/40"
          >
            {t('openAsset')}
          </Link>

          {txUrl ? (
            <a
              href={txUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-[var(--border)] px-5 py-2 text-sm font-medium transition hover:bg-[var(--muted)]/40"
            >
              {t('lastPurchaseTx')}
            </a>
          ) : null}
        </div>
      </article>

      <PortfolioSellDialog
        open={sellOpen}
        onClose={() => setSellOpen(false)}
        energyUserId={energyUserId}
        assetId={position.assetId}
        buckets={position.buckets}
        onSuccess={async () => {
          await onSuccess?.();
        }}
      />
    </>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {label}
      </div>
      <div className="mt-3 break-all text-sm font-semibold text-[var(--foreground)]">
        {value}
      </div>
    </div>
  );
}

function BucketCard({
  title,
  shares,
  emptyLabel,
}: {
  title: string;
  shares: number;
  emptyLabel: string;
}) {
  const hasShares = shares > 0;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium">{title}</div>
        <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
          {shares}
        </span>
      </div>

      <div className="mt-3 text-sm text-[var(--muted-foreground)]">
        {hasShares ? null : emptyLabel}
      </div>
    </div>
  );
}

function shortHash(value: string): string {
  if (value.length <= 16) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}