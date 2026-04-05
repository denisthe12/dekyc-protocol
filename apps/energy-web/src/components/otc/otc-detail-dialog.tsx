'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Dialog,
  DialogDescription,
  DialogTitle,
  StyledDialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { OtcListingItem } from '@/lib/api/otc';
import { fillOtcListing } from '@/lib/api/otc';
import { fetchEnergyMe } from '@/lib/api/energy';
import { loadEnergySession } from '@/lib/session';
import { formatKzte } from '@/lib/formatters';
import { ConfirmActionDialog } from '@/components/security/confirm-action-dialog';

type OtcDetailDialogProps = {
  open: boolean;
  onClose: () => void;
  listing: OtcListingItem | null;
  isOwnListing: boolean;
  onSuccess?: () => Promise<void> | void;
};

export function OtcDetailDialog({
  open,
  onClose,
  listing,
  isOwnListing,
  onSuccess,
}: OtcDetailDialogProps) {
  const t = useTranslations('OtcPage');
  const locale = useLocale();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!listing) {
    return null;
  }

  async function handleConfirmedBuy(): Promise<void> {
    try {
      setSubmitting(true);
      setError(null);

      const session = loadEnergySession();
      if (!session) {
        throw new Error(t('errors.sessionNotFound'));
      }

      const me = await fetchEnergyMe(session.accessToken);
      
      if (listing){
        await fillOtcListing({
            energyUserId: me.id,
            listingId: listing.listingId,
        });
      }

      await onSuccess?.();
      setConfirmOpen(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.buyFailed'));
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
        <StyledDialogContent>
          <div className="space-y-5">
            <div>
              <DialogTitle className="text-xl font-semibold">
                {t('listingDetails')}
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-[var(--muted-foreground)]">
                {t('listingDescription')}
              </DialogDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
                {listing.status}
              </span>
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
                {listing.payoutMode}
              </span>
              {isOwnListing ? (
                <span className="rounded-full border border-amber-800 bg-amber-950/30 px-3 py-1 text-xs font-medium text-amber-300">
                  {t('yourListing')}
                </span>
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <DetailTile label={t('assetId')} value={listing.assetId} />
              <DetailTile label={t('listingId')} value={listing.listingId} />
              <DetailTile label={t('shares')} value={`${listing.shareAmount}`} />
              <DetailTile
                label={t('pricePerShare')}
                value={`${formatKzte(listing.pricePerShareKzte, locale === 'en' ? 'en' : 'ru')} KZTE`}
              />
              <DetailTile
                label={t('totalPrice')}
                value={`${formatKzte(listing.totalPriceKzte, locale === 'en' ? 'en' : 'ru')} KZTE`}
              />
              <DetailTile label={t('seller')} value={listing.sellerEnergyUserId} />
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={submitting || isOwnListing || listing.status !== 'OPEN'}
              >
                {t('buyListing')}
              </Button>

              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                {t('close')}
              </Button>
            </div>
          </div>
        </StyledDialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmedBuy}
        title={t('confirmBuyTitle')}
        description={t('confirmBuyDescription', {
          shares: listing.shareAmount,
          payoutMode: listing.payoutMode,
        })}
      />
    </>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {label}
      </div>
      <div className="mt-3 break-all text-sm font-medium text-[var(--foreground)]">
        {value}
      </div>
    </div>
  );
}