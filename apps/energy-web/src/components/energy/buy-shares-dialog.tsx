'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  StyledDialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ConfirmActionDialog } from '@/components/security/confirm-action-dialog';
import { buyDemoShares } from '@/lib/api/buy-shares';
import { fetchEnergyMe } from '@/lib/api/energy';
import { loadEnergySession } from '@/lib/session';
import { formatKzte } from '@/lib/formatters';

type BuySharesDialogProps = {
  open: boolean;
  onClose: () => void;
  assetId: string;
  pricePerShareKzte: number;
  onSuccess?: () => Promise<void> | void;
};

type PayoutMode = 'KZTE' | 'ENERGY_POINTS';

export function BuySharesDialog({
  open,
  onClose,
  assetId,
  pricePerShareKzte,
  onSuccess,
}: BuySharesDialogProps) {
  const t = useTranslations('BuySharesDialog');

  const [quantity, setQuantity] = useState('1');
  const [payoutMode, setPayoutMode] = useState<PayoutMode>('KZTE');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setQuantity('1');
      setPayoutMode('KZTE');
      setConfirmOpen(false);
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  const quantityNumber = Number(quantity);
  const totalPriceBaseUnits =
    Number.isFinite(quantityNumber) && quantityNumber > 0
      ? quantityNumber * pricePerShareKzte
      : 0;

  const totalPriceLabel = useMemo(() => {
    return formatKzte(totalPriceBaseUnits);
  }, [totalPriceBaseUnits]);

  function handleContinue(): void {
    if (!Number.isInteger(quantityNumber) || quantityNumber <= 0) {
      setError(t('errors.invalidQuantity'));
      return;
    }

    setError(null);
    setConfirmOpen(true);
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

      await buyDemoShares({
        energyUserId: me.id,
        assetId,
        shareAmount: quantityNumber,
        payoutMode,
      });

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
                {t('title')}
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-zinc-400">
                {t('description')}
              </DialogDescription>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-zinc-400">{t('quantity')}</label>
              <Input
                type="number"
                min={1}
                step={1}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder={t('quantityPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-zinc-400">{t('payoutMode')}</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={payoutMode === 'KZTE' ? 'default' : 'outline'}
                  onClick={() => setPayoutMode('KZTE')}
                >
                  {t('modes.kzte')}
                </Button>
                <Button
                  type="button"
                  variant={payoutMode === 'ENERGY_POINTS' ? 'default' : 'outline'}
                  onClick={() => setPayoutMode('ENERGY_POINTS')}
                >
                  {t('modes.energyPoints')}
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
              {t('totalPrice')}: <span className="font-semibold">{totalPriceLabel} KZTE</span>
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
        onConfirm={handleConfirmedBuy}
        title={t('confirmTitle')}
        description={t('confirmDescription', {
          quantity: quantityNumber || 0,
          payoutMode: payoutMode === 'KZTE' ? t('modes.kzte') : t('modes.energyPoints'),
        })}
      />
    </>
  );
}