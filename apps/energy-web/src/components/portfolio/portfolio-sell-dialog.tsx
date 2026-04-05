'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogDescription,
  DialogTitle,
  StyledDialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ConfirmActionDialog } from '@/components/security/confirm-action-dialog';
import { createOtcListing } from '@/lib/api/otc';
import { formatKzte } from '@/lib/formatters';

type PortfolioSellDialogProps = {
  open: boolean;
  onClose: () => void;
  energyUserId: string;
  assetId: string;
  buckets: {
    KZTE: number;
    ENERGY_POINTS: number;
  };
  onSuccess?: () => Promise<void> | void;
};

type PayoutMode = 'KZTE' | 'ENERGY_POINTS';

export function PortfolioSellDialog({
  open,
  onClose,
  energyUserId,
  assetId,
  buckets,
  onSuccess,
}: PortfolioSellDialogProps) {
  const t = useTranslations('PortfolioPage');

  const defaultMode: PayoutMode =
    buckets.KZTE > 0 ? 'KZTE' : 'ENERGY_POINTS';

  const [payoutMode, setPayoutMode] = useState<PayoutMode>(defaultMode);
  const [shareAmount, setShareAmount] = useState('1');
  const [pricePerShare, setPricePerShare] = useState('10000');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxShares =
    payoutMode === 'KZTE' ? buckets.KZTE : buckets.ENERGY_POINTS;

  useEffect(() => {
    if (!open) {
      const nextDefaultMode: PayoutMode =
        buckets.KZTE > 0 ? 'KZTE' : 'ENERGY_POINTS';

      setPayoutMode(nextDefaultMode);
      setShareAmount('1');
      setPricePerShare('10000');
      setConfirmOpen(false);
      setSubmitting(false);
      setError(null);
    }
  }, [open, buckets]);

  useEffect(() => {
    if (maxShares <= 0) {
      if (payoutMode === 'KZTE' && buckets.ENERGY_POINTS > 0) {
        setPayoutMode('ENERGY_POINTS');
      } else if (payoutMode === 'ENERGY_POINTS' && buckets.KZTE > 0) {
        setPayoutMode('KZTE');
      }
    }
  }, [payoutMode, maxShares, buckets]);

  const shareAmountNumber = Number(shareAmount);
  const pricePerShareNumber = Number(pricePerShare);

  const totalPrice = useMemo(() => {
    if (
      !Number.isInteger(shareAmountNumber) ||
      shareAmountNumber <= 0 ||
      !Number.isInteger(pricePerShareNumber) ||
      pricePerShareNumber <= 0
    ) {
      return 0;
    }

    return shareAmountNumber * pricePerShareNumber;
  }, [shareAmountNumber, pricePerShareNumber]);

  function handleContinue(): void {
    if (maxShares <= 0) {
      setError(t('errors.noSharesInSelectedBucket'));
      return;
    }

    if (!Number.isInteger(shareAmountNumber) || shareAmountNumber <= 0) {
      setError(t('errors.invalidShareAmount'));
      return;
    }

    if (shareAmountNumber > maxShares) {
      setError(t('errors.exceedsAvailable'));
      return;
    }

    if (!Number.isInteger(pricePerShareNumber) || pricePerShareNumber <= 0) {
      setError(t('errors.invalidPrice'));
      return;
    }

    setError(null);
    setConfirmOpen(true);
  }

  async function handleConfirmedCreate(): Promise<void> {
    try {
      setSubmitting(true);
      setError(null);

      await createOtcListing({
        energyUserId,
        assetId,
        shareAmount: shareAmountNumber,
        pricePerShareKzte: pricePerShareNumber,
        payoutMode,
      });

      await onSuccess?.();
      setConfirmOpen(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.createListingFailed'));
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
                {t('sellDialogTitle')}
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-[var(--muted-foreground)]">
                {t('sellDialogDescription')}
              </DialogDescription>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-[var(--muted-foreground)]">
                {t('bucket')}
              </label>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={payoutMode === 'KZTE' ? 'default' : 'outline'}
                  onClick={() => setPayoutMode('KZTE')}
                  disabled={buckets.KZTE <= 0}
                >
                  KZTE ({buckets.KZTE})
                </Button>

                <Button
                  type="button"
                  variant={payoutMode === 'ENERGY_POINTS' ? 'default' : 'outline'}
                  onClick={() => setPayoutMode('ENERGY_POINTS')}
                  disabled={buckets.ENERGY_POINTS <= 0}
                >
                  ENERGY_POINTS ({buckets.ENERGY_POINTS})
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4 text-sm text-[var(--muted-foreground)]">
              {t('availableShares')}: <span className="font-semibold text-[var(--foreground)]">{maxShares}</span>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-[var(--muted-foreground)]">
                {t('shareAmount')}
              </label>
              <Input
                type="number"
                min={1}
                step={1}
                value={shareAmount}
                onChange={(event) => setShareAmount(event.target.value)}
                placeholder={t('shareAmountPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-[var(--muted-foreground)]">
                {t('pricePerShare')}
              </label>
              <Input
                type="number"
                min={1}
                step={1}
                value={pricePerShare}
                onChange={(event) => setPricePerShare(event.target.value)}
                placeholder={t('pricePerSharePlaceholder')}
              />
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4 text-sm text-[var(--muted-foreground)]">
              {t('totalPrice')}: <span className="font-semibold text-[var(--foreground)]">{formatKzte(totalPrice)} KZTE</span>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            <div className="flex gap-2">
              <Button type="button" onClick={handleContinue} disabled={submitting}>
                {t('continue')}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </StyledDialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmedCreate}
        title={t('confirmSellTitle')}
        description={t('confirmSellDescription', {
          shareAmount: shareAmountNumber || 0,
          payoutMode,
        })}
      />
    </>
  );
}