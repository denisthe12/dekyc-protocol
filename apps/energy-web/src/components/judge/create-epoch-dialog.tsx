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
import { createRevenueEpoch, JudgeCreateEpochResponse } from '@/lib/api/judge';
import { formatKzte } from '@/lib/formatters';

export type JudgeAssetOption = {
  assetId: string;
  title: string;
  totalShares: number;
  pricePerShareKzte: number;
};

type CreateEpochDialogProps = {
  open: boolean;
  onClose: () => void;
  assets: JudgeAssetOption[];
  onSuccess?: (result: JudgeCreateEpochResponse) => Promise<void> | void;
};

export function CreateEpochDialog({
  open,
  onClose,
  assets,
  onSuccess,
}: CreateEpochDialogProps) {
  const t = useTranslations('JudgePage');

  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [totalAmountKzte, setTotalAmountKzte] = useState('21000');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<JudgeCreateEpochResponse | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedAssetId('');
      setTotalAmountKzte('21000');
      setSubmitting(false);
      setError(null);
      setSuccessResult(null);
      return;
    }

    if (assets.length > 0 && !selectedAssetId) {
      setSelectedAssetId(assets[0].assetId);
    }
  }, [open, assets, selectedAssetId]);

  const selectedAsset = useMemo(() => {
    return assets.find((item) => item.assetId === selectedAssetId) ?? null;
  }, [assets, selectedAssetId]);

  async function handleCreate(): Promise<void> {
    try {
      setSubmitting(true);
      setError(null);
      setSuccessResult(null);

      const amount = Number(totalAmountKzte);

      if (!selectedAssetId) {
        throw new Error(t('errors.assetRequired'));
      }

      if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error(t('errors.invalidEpochAmount'));
      }

      const result = await createRevenueEpoch({
        assetId: selectedAssetId,
        totalAmountKzte: amount,
      });

      setSuccessResult(result);
      await onSuccess?.(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('errors.createEpochFailed'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <StyledDialogContent>
        <div className="space-y-5">
          <div>
            <DialogTitle className="text-xl font-semibold">
              {t('createEpochTitle')}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-zinc-400">
              {t('createEpochDescription')}
            </DialogDescription>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-zinc-400">
              {t('assetSelect')}
            </label>
            <select
              value={selectedAssetId}
              onChange={(event) => setSelectedAssetId(event.target.value)}
              className="flex h-10 w-full rounded-xl border border-[var(--input)] bg-transparent px-3 py-2 text-sm outline-none"
            >
              {assets.map((asset) => (
                <option key={asset.assetId} value={asset.assetId} className="bg-zinc-900">
                  {asset.title} ({asset.assetId})
                </option>
              ))}
            </select>
          </div>

          {selectedAsset ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="text-xs text-zinc-500">{t('selectedAssetShares')}</div>
                <div className="mt-2 text-sm text-zinc-300">{selectedAsset.totalShares}</div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="text-xs text-zinc-500">{t('selectedAssetPrice')}</div>
                <div className="mt-2 text-sm text-zinc-300">
                  {formatKzte(selectedAsset.pricePerShareKzte)} KZTE
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="block text-sm text-zinc-400">
              {t('epochAmount')}
            </label>
            <Input
              type="number"
              min={1}
              step={1}
              value={totalAmountKzte}
              onChange={(event) => setTotalAmountKzte(event.target.value)}
              placeholder={t('epochAmountPlaceholder')}
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          {successResult ? (
            <div className="rounded-2xl border border-emerald-900 bg-emerald-950/40 p-4 text-sm text-emerald-300">
              <div>{t('epochCreatedSuccess')}</div>
              <div className="mt-2 text-xs break-all">
                Epoch #{successResult.epochIndex} · {successResult.revenueEpochPda}
              </div>
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button type="button" onClick={() => void handleCreate()} disabled={submitting}>
              {submitting ? t('creatingEpoch') : t('createEpochButton')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              {t('cancel')}
            </Button>
          </div>
        </div>
      </StyledDialogContent>
    </Dialog>
  );
}