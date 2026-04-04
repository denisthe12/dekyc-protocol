import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import type { PublicAssetItem } from '@/lib/api/public-assets';
import { formatKzte } from '@/lib/formatters';

type AssetCardProps = {
  asset: PublicAssetItem;
};

export function AssetCard({ asset }: AssetCardProps) {
  const t = useTranslations('AssetsPage');
  const locale = useLocale();

  const soldPercent =
    asset.totalShares > 0
      ? Math.min(Math.round((asset.soldShares / asset.totalShares) * 100), 100)
      : 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={asset.coverImageUrl || '/demo-assets/solar.jpg'}
          alt={asset.title}
          fill
          loading="eager"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 40vw"
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white">
              {asset.assetType}
            </div>

            <div className="rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white">
              {soldPercent}% {t('sold')}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-3 p-4">
        <div>
          <h3 className="line-clamp-2 min-h-[3.25rem] text-[1.05rem] font-semibold leading-7 tracking-tight text-[var(--foreground)]">
            {asset.title}
          </h3>
          <p className="mt-0.5 min-h-[1.25rem] line-clamp-1 text-sm text-[var(--muted-foreground)]">
            {asset.location || t('unknownLocation')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 p-2.5">
            <div className="flex min-h-[98px] flex-col items-center justify-between text-center">
              <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                {t('pricePerShare')}
              </div>

              <div className="flex flex-1 items-center justify-center">
                <div className="text-[0.98rem] font-semibold leading-6 text-[var(--foreground)]">
                  {formatKzte(asset.pricePerShareKzte, locale === 'en' ? 'en' : 'ru')} KZTE
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 p-2.5">
            <div className="flex min-h-[98px] flex-col items-center justify-between text-center">
              <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                {t('investorShare')}
              </div>

              <div className="flex flex-1 items-center justify-center">
                <div className="text-[0.98rem] font-semibold leading-6 text-[var(--foreground)]">
                  {asset.investorBps / 100}%
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 p-2.5">
            <div className="flex min-h-[98px] flex-col items-center justify-between text-center">
              <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                {t('shares')}
              </div>

              <div className="flex flex-1 items-center justify-center">
                <div className="text-[0.98rem] font-semibold leading-6 text-[var(--foreground)]">
                  {asset.remainingShares}/{asset.totalShares}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 p-2.5">
            <div className="flex min-h-[98px] flex-col items-center justify-between text-center">
              <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                {t('payoutModes')}
              </div>

              <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-1">
                  {asset.supportedPayoutModes.map((mode) => (
                    <span
                      key={mode}
                      className="text-[0.98rem] font-semibold leading-6 text-[var(--foreground)]"
                    >
                      {mode === 'ENERGY_POINTS' ? 'EP' : mode}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Link
          href={`/${locale}/assets/${asset.assetId}`}
          className="mt-auto inline-flex w-full items-center justify-center rounded-2xl bg-[var(--foreground)] px-4 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
        >
          {t('viewAsset')}
        </Link>
      </div>
    </article>
  );
}