'use client';

import { useLocale, useTranslations } from 'next-intl';
import { formatKzte } from '@/lib/formatters';
import type { OtcListingItem } from '@/lib/api/otc';

type OtcCardProps = {
  listing: OtcListingItem;
  onOpen: (listing: OtcListingItem) => void;
  isOwnListing: boolean;
};

export function OtcCard({ listing, onOpen, isOwnListing }: OtcCardProps) {
  const t = useTranslations('OtcPage');
  const locale = useLocale();

  return (
    <button
      type="button"
      onClick={() => onOpen(listing)}
      className="group flex h-full flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[11px] font-medium">
          {listing.status}
        </span>

        <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[11px] font-medium">
          {listing.payoutMode === 'ENERGY_POINTS' ? 'EP' : listing.payoutMode}
        </span>

        {isOwnListing ? (
          <span className="rounded-full border border-amber-800 bg-amber-950/30 px-3 py-1 text-[11px] font-medium text-amber-300">
            {t('yourListing')}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
          Asset {listing.assetId}
        </div>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
          OTC Listing #{listing.listingId}
        </h3>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MetricTile
          label={t('shares')}
          value={`${listing.shareAmount}`}
        />
        <MetricTile
          label={t('pricePerShare')}
          value={`${formatKzte(listing.pricePerShareKzte, locale === 'en' ? 'en' : 'ru')} KZTE`}
        />
        <MetricTile
          label={t('totalPrice')}
          value={`${formatKzte(listing.totalPriceKzte, locale === 'en' ? 'en' : 'ru')} KZTE`}
        />
        <MetricTile
          label={t('seller')}
          value={shortId(listing.sellerEnergyUserId)}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 px-4 py-3 text-sm text-[var(--muted-foreground)]">
        {isOwnListing ? t('openOwnListingHint') : t('openListingHint')}
      </div>

      <div className="mt-auto pt-4">
        <div className="inline-flex rounded-2xl bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)] transition group-hover:opacity-90">
          {t('viewListing')}
        </div>
      </div>
    </button>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 p-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {label}
      </div>
      <div className="mt-3 text-sm font-semibold text-[var(--foreground)]">
        {value}
      </div>
    </div>
  );
}

function shortId(value: string): string {
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}