'use client';

import { useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type AssetFiltersProps = {
  locations: string[];
  assetTypes: string[];
};

export function AssetFilters({ locations, assetTypes }: AssetFiltersProps) {
  const t = useTranslations('AssetsPage');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const paramsObject = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(paramsObject.toString());

    if (!value || value === 'ALL') {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <aside className="sticky top-24 space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
          {t('filters')}
        </div>
        <h2 className="mt-3 text-lg font-semibold text-[var(--foreground)]">
          {t('refineSelection')}
        </h2>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-[var(--muted-foreground)]">
          {t('search')}
        </label>
        <Input
          defaultValue={searchParams.get('search') ?? ''}
          onBlur={(event) => updateParam('search', event.target.value)}
          placeholder={t('searchPlaceholder')}
          className="rounded-2xl"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-[var(--muted-foreground)]">
          {t('location')}
        </label>
        <Select
          defaultValue={searchParams.get('location') ?? 'ALL'}
          onValueChange={(value) => updateParam('location', value)}
        >
          <SelectTrigger className="rounded-2xl">
            <SelectValue placeholder={t('allLocations')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('allLocations')}</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-[var(--muted-foreground)]">
          {t('assetType')}
        </label>
        <Select
          defaultValue={searchParams.get('assetType') ?? 'ALL'}
          onValueChange={(value) => updateParam('assetType', value)}
        >
          <SelectTrigger className="rounded-2xl">
            <SelectValue placeholder={t('allAssetTypes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('allAssetTypes')}</SelectItem>
            {assetTypes.map((assetType) => (
              <SelectItem key={assetType} value={assetType}>
                {assetType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-[var(--muted-foreground)]">
          {t('minInvestorShare')}
        </label>
        <Input
          type="number"
          min={0}
          max={100}
          defaultValue={searchParams.get('minInvestorPct') ?? ''}
          onBlur={(event) => updateParam('minInvestorPct', event.target.value)}
          placeholder="0"
          className="rounded-2xl"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm text-[var(--muted-foreground)]">
            {t('minPrice')}
          </label>
          <Input
            type="number"
            min={0}
            defaultValue={searchParams.get('minPrice') ?? ''}
            onBlur={(event) => updateParam('minPrice', event.target.value)}
            placeholder="0"
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-[var(--muted-foreground)]">
            {t('maxPrice')}
          </label>
          <Input
            type="number"
            min={0}
            defaultValue={searchParams.get('maxPrice') ?? ''}
            onBlur={(event) => updateParam('maxPrice', event.target.value)}
            placeholder="50000"
            className="rounded-2xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-[var(--muted-foreground)]">
          {t('payoutMode')}
        </label>
        <Select
          defaultValue={searchParams.get('payoutMode') ?? 'ALL'}
          onValueChange={(value) => updateParam('payoutMode', value)}
        >
          <SelectTrigger className="rounded-2xl">
            <SelectValue placeholder={t('allPayoutModes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('allPayoutModes')}</SelectItem>
            <SelectItem value="KZTE">KZTE</SelectItem>
            <SelectItem value="ENERGY_POINTS">ENERGY_POINTS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-[var(--muted-foreground)]">
          {t('sortBy')}
        </label>
        <Select
          defaultValue={searchParams.get('sort') ?? 'newest'}
          onValueChange={(value) => updateParam('sort', value)}
        >
          <SelectTrigger className="rounded-2xl">
            <SelectValue placeholder={t('sortNewest')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('sortNewest')}</SelectItem>
            <SelectItem value="highestInvestorShare">
              {t('sortHighestInvestorShare')}
            </SelectItem>
            <SelectItem value="lowestPrice">{t('sortLowestPrice')}</SelectItem>
            <SelectItem value="mostFunded">{t('sortMostFunded')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </aside>
  );
}