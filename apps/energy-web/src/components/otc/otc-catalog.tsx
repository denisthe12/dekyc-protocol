'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { OtcListingItem } from '@/lib/api/otc';
import { OtcCard } from '@/components/otc/otc-card';
import { OtcFilters } from '@/components/otc/otc-filters';
import { OtcSidebar } from '@/components/otc/otc-sidebar';
import { OtcDetailDialog } from '@/components/otc/otc-detail-dialog';

type OtcCatalogProps = {
  listings: OtcListingItem[];
  currentEnergyUserId: string | null;
  onRefresh?: () => Promise<void> | void;
};

export function OtcCatalog({
  listings,
  currentEnergyUserId,
  onRefresh,
}: OtcCatalogProps) {
  const t = useTranslations('OtcPage');
  const searchParams = useSearchParams();
  const [selectedListing, setSelectedListing] = useState<OtcListingItem | null>(null);

  const filteredListings = useMemo(() => {
    const search = (searchParams.get('search') ?? '').toLowerCase().trim();
    const payoutMode = searchParams.get('payoutMode') ?? '';
    const status = searchParams.get('status') ?? '';
    const minPrice = Number(searchParams.get('minPrice') ?? '0');
    const maxPrice = Number(searchParams.get('maxPrice') ?? '0');
    const sort = searchParams.get('sort') ?? 'newest';

    let result = listings.filter((listing) => {
      const matchesSearch =
        !search ||
        listing.assetId.toLowerCase().includes(search) ||
        listing.listingId.toLowerCase().includes(search) ||
        listing.sellerEnergyUserId.toLowerCase().includes(search);

      const matchesPayoutMode = !payoutMode || listing.payoutMode === payoutMode;
      const matchesStatus = !status || listing.status === status;
      const matchesMinPrice = listing.pricePerShareKzte >= minPrice;
      const matchesMaxPrice = !maxPrice || listing.pricePerShareKzte <= maxPrice;

      return (
        matchesSearch &&
        matchesPayoutMode &&
        matchesStatus &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });

    result = [...result].sort((a, b) => {
      if (sort === 'lowestPrice') {
        return a.pricePerShareKzte - b.pricePerShareKzte;
      }

      if (sort === 'highestPrice') {
        return b.pricePerShareKzte - a.pricePerShareKzte;
      }

      if (sort === 'largestSize') {
        return b.shareAmount - a.shareAmount;
      }

      return b.createdAt.localeCompare(a.createdAt);
    });

    return result;
  }, [listings, searchParams]);

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        <div className="hidden xl:block">
          <OtcFilters />
        </div>

        <div className="space-y-6">
          <div className="xl:hidden">
            <OtcFilters />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                {t('marketplace')}
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                {t('availableListings')}
              </h2>
            </div>

            <div className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted-foreground)]">
              {filteredListings.length} {t('results')}
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 text-center text-[var(--muted-foreground)] shadow-sm">
              {t('noListingsFound')}
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-2">
              {filteredListings.map((listing) => (
                <OtcCard
                  key={listing.id}
                  listing={listing}
                  onOpen={setSelectedListing}
                  isOwnListing={currentEnergyUserId === listing.sellerEnergyUserId}
                />
              ))}
            </div>
          )}
        </div>

        <div className="hidden xl:block">
          <OtcSidebar />
        </div>
      </div>

      <OtcDetailDialog
        open={selectedListing !== null}
        onClose={() => setSelectedListing(null)}
        listing={selectedListing}
        isOwnListing={
          selectedListing !== null &&
          currentEnergyUserId === selectedListing.sellerEnergyUserId
        }
        onSuccess={async () => {
          await onRefresh?.();
        }}
      />
    </>
  );
}