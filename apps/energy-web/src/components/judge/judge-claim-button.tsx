'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogDescription,
  DialogTitle,
  StyledDialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { claimPayout } from '@/lib/api/judge';
import { formatKzte } from '@/lib/formatters';

type JudgeClaimButtonProps = {
  energyUserId: string;
  assetId: string;
  epochIndex: number;
  estimatedKzteAmount: number;
  estimatedEnergyPointsAmount: number;
  kzteShares: number;
  energyPointsShares: number;
  alreadyClaimed?: boolean;
};

export function JudgeClaimButton({
  energyUserId,
  assetId,
  epochIndex,
  estimatedKzteAmount,
  estimatedEnergyPointsAmount,
  kzteShares,
  energyPointsShares,
  alreadyClaimed = false,
}: JudgeClaimButtonProps) {
  const t = useTranslations('JudgePage');
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClaim(): Promise<void> {
    try {
      setClaiming(true);
      setError(null);

      await claimPayout({
        energyUserId,
        assetId,
        epochIndex,
      });

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.claimFailed'));
    } finally {
      setClaiming(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={alreadyClaimed || claiming}
        className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {alreadyClaimed
          ? t('claimAlreadyClaimed')
          : claiming
            ? t('claimingPayout')
            : t('claimPayoutButton')}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <StyledDialogContent className="max-w-xl overflow-hidden p-0">
          <div className="border-b border-[var(--border)] bg-[var(--muted)]/30 px-6 py-5">
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              {t('claimDialogEyebrow')}
            </div>

            <DialogTitle className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              {t('claimDialogTitle')}
            </DialogTitle>

            <DialogDescription className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {t('claimDialogDescription')}
            </DialogDescription>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)]/40 p-4">
                <div className="text-xs text-[var(--muted-foreground)]">
                  {t('assetId')}
                </div>
                <div className="mt-2 break-all text-sm font-semibold text-[var(--foreground)]">
                  {assetId}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)]/40 p-4">
                <div className="text-xs text-[var(--muted-foreground)]">
                  {t('epoch')}
                </div>
                <div className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                  #{epochIndex}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)]/40 p-4">
                <div className="text-xs text-[var(--muted-foreground)]">
                  {t('claimUserId')}
                </div>
                <div className="mt-2 truncate text-sm font-semibold text-[var(--foreground)]">
                  {energyUserId}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--muted)]/20 p-5">
              <div className="text-sm font-semibold text-[var(--foreground)]">
                {t('claimDialogCalculation')}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <div className="text-xs text-[var(--muted-foreground)]">
                    KZTE
                  </div>

                  <div className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                    {formatKzte(estimatedKzteAmount)}
                  </div>

                  <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {t('shares')}: {kzteShares}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <div className="text-xs text-[var(--muted-foreground)]">
                    ENERGY_POINTS
                  </div>

                  <div className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                    {formatKzte(estimatedEnergyPointsAmount)}
                  </div>

                  <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {t('shares')}: {energyPointsShares}
                  </div>
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={claiming}
              >
                {t('cancel')}
              </Button>

              <Button
                type="button"
                onClick={() => void handleClaim()}
                disabled={claiming}
                className="bg-emerald-500 text-black hover:bg-emerald-400"
              >
                {claiming ? t('claimingPayout') : t('claimDialogConfirm')}
              </Button>
            </div>
          </div>
        </StyledDialogContent>
      </Dialog>
    </>
  );
}