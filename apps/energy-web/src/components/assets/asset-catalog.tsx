'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { PublicAssetItem } from '@/lib/api/public-assets';
import { AssetCard } from '@/components/assets/asset-card';
import { AssetFilters } from '@/components/assets/asset-filters';
import { AssetSidebar } from '@/components/assets/asset-sidebar';

type AssetCatalogProps = {
  assets: PublicAssetItem[];
};

export function AssetCatalog({ assets }: AssetCatalogProps) {
  const t = useTranslations('AssetsPage');
  const searchParams = useSearchParams();

  const locations = useMemo(
    () =>
      Array.from(
        new Set(
          assets
            .map((asset) => asset.location)
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort(),
    [assets],
  );

  const assetTypes = useMemo(
    () => Array.from(new Set(assets.map((asset) => asset.assetType))).sort(),
    [assets],
  );

  const filteredAssets = useMemo(() => {
    const search = (searchParams.get('search') ?? '').toLowerCase().trim();
    const location = searchParams.get('location') ?? '';
    const assetType = searchParams.get('assetType') ?? '';
    const payoutMode = searchParams.get('payoutMode') ?? '';
    const minInvestorPct = Number(searchParams.get('minInvestorPct') ?? '0');
    const minPrice = Number(searchParams.get('minPrice') ?? '0');
    const maxPrice = Number(searchParams.get('maxPrice') ?? '0');
    const sort = searchParams.get('sort') ?? 'newest';

    let result = assets.filter((asset) => {
      const matchesSearch =
        !search ||
        asset.title.toLowerCase().includes(search) ||
        (asset.description ?? '').toLowerCase().includes(search) ||
        (asset.location ?? '').toLowerCase().includes(search);

      const matchesLocation = !location || asset.location === location;
      const matchesAssetType = !assetType || asset.assetType === assetType;
      const matchesPayoutMode =
        !payoutMode || asset.supportedPayoutModes.includes(payoutMode);
      const matchesInvestorPct = asset.investorBps / 100 >= minInvestorPct;
      const matchesMinPrice = asset.pricePerShareKzte >= minPrice;
      const matchesMaxPrice =
        !maxPrice || asset.pricePerShareKzte <= maxPrice;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesAssetType &&
        matchesPayoutMode &&
        matchesInvestorPct &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });

    result = [...result].sort((a, b) => {
      if (sort === 'highestInvestorShare') {
        return b.investorBps - a.investorBps;
      }

      if (sort === 'lowestPrice') {
        return a.pricePerShareKzte - b.pricePerShareKzte;
      }

      if (sort === 'mostFunded') {
        const aPct = a.totalShares > 0 ? a.soldShares / a.totalShares : 0;
        const bPct = b.totalShares > 0 ? b.soldShares / b.totalShares : 0;
        return bPct - aPct;
      }

      return b.assetId.localeCompare(a.assetId);
    });

    return result;
  }, [assets, searchParams]);

  return (
    <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
      <div className="hidden xl:block">
        <AssetFilters locations={locations} assetTypes={assetTypes} />
      </div>

      <div className="space-y-6">
        <div className="xl:hidden">
          <AssetFilters locations={locations} assetTypes={assetTypes} />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              {t('catalog')}
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              {t('availableAssets')}
            </h2>
          </div>

          <div className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted-foreground)]">
            {filteredAssets.length} {t('results')}
          </div>
        </div>

        {filteredAssets.length === 0 ? (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 text-center text-[var(--muted-foreground)] shadow-sm">
            {t('noAssetsFound')}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
            {filteredAssets.map((asset) => (
              <AssetCard key={asset.assetId} asset={asset} />
            ))}
          </div>
        )}
      </div>

      <div className="hidden xl:block">
        <AssetSidebar />
      </div>
    </div>
  );
}