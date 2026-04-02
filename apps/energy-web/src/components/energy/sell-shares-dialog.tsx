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
import { fetchEnergyMe } from '@/lib/api/energy';
import { loadEnergySession } from '@/lib/session';
import { formatKzte } from '@/lib/formatters';

type SellSharesDialogProps = {
  open: boolean;
  onClose: () => void;
  assetId: string;
  payoutMode: 'KZTE' | 'ENERGY_POINTS';
  maxShares: number;
  onSuccess?: () => Promise<void> | void;
};

export function SellSharesDialog({
  open,
  onClose,
  assetId,
  payoutMode,
  maxShares,
  onSuccess,
}: SellSharesDialogProps) {
  const t = useTranslations('SellSharesDialog');

  const [shareAmount, setShareAmount] = useState('1');
  const [pricePerShare, setPricePerShare] = useState('10000');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setShareAmount('1');
      setPricePerShare('10000');
      setConfirmOpen(false);
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

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

      const session = loadEnergySession();
      if (!session) {
        throw new Error(t('errors.sessionNotFound'));
      }

      const me = await fetchEnergyMe(session.accessToken);

      await createOtcListing({
        energyUserId: me.id,
        assetId,
        shareAmount: shareAmountNumber,
        pricePerShareKzte: pricePerShareNumber,
        payoutMode,
      });

      await onSuccess?.();
      setConfirmOpen(false);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('errors.createFailed'),
      );
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
                {t('title')}
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-zinc-400">
                {t('description')}
              </DialogDescription>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
              {t('bucket')}: <span className="font-semibold">{payoutMode}</span>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
              {t('available')}: <span className="font-semibold">{maxShares}</span>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-zinc-400">{t('shareAmount')}</label>
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
              <label className="block text-sm text-zinc-400">{t('pricePerShare')}</label>
              <Input
                type="number"
                min={1}
                step={1}
                value={pricePerShare}
                onChange={(event) => setPricePerShare(event.target.value)}
                placeholder={t('pricePerSharePlaceholder')}
              />
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
              {t('totalPrice')}: <span className="font-semibold">{formatKzte(totalPrice)} KZTE</span>
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
        title={t('confirmTitle')}
        description={t('confirmDescription', {
          shareAmount: shareAmountNumber || 0,
          payoutMode,
        })}
      />
    </>
  );
}