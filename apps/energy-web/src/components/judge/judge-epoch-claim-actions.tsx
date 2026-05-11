'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { JudgeSummary } from '@/lib/api/judge';
import { loadEnergySession } from '@/lib/session';
import { JudgeClaimButton } from './judge-claim-button';

type JudgeEpochClaimActionsProps = {
  epoch: JudgeSummary['epochs'][number];
  asset: JudgeSummary['assets'][number] | null;
  positions: JudgeSummary['positions'];
  claims: JudgeSummary['claims'];
};

export function JudgeEpochClaimActions({
  epoch,
  asset,
  positions,
  claims,
}: JudgeEpochClaimActionsProps) {
  const t = useTranslations('JudgePage');

  const [currentEnergyUserId, setCurrentEnergyUserId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const session = loadEnergySession();
    setCurrentEnergyUserId(session?.user.id ?? null);
  }, []);

  const currentUserPositions = useMemo(() => {
    if (!currentEnergyUserId) {
      return [];
    }

    return positions.filter(
      (position) =>
        position.energyUserId === currentEnergyUserId &&
        position.energyAssetId === epoch.energyAssetId &&
        position.status === 'ACTIVE',
    );
  }, [currentEnergyUserId, epoch.energyAssetId, positions]);

  const alreadyClaimed = useMemo(() => {
    if (!currentEnergyUserId) {
      return false;
    }

    return claims.some(
      (claim) =>
        claim.energyUserId === currentEnergyUserId &&
        claim.energyRevenueEpochId === epoch.id,
    );
  }, [claims, currentEnergyUserId, epoch.id]);

  const kzteShares = currentUserPositions
    .filter((position) => position.payoutMode === 'KZTE')
    .reduce((sum, position) => sum + position.totalSharesPurchased, 0);

  const energyPointsShares = currentUserPositions
    .filter((position) => position.payoutMode === 'ENERGY_POINTS')
    .reduce((sum, position) => sum + position.totalSharesPurchased, 0);

  const totalShares = kzteShares + energyPointsShares;

  if (!asset || !currentEnergyUserId || currentUserPositions.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--background)]/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-[var(--foreground)]">
            {t('claimAvailableTitle')}
          </div>

          <div className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
            {t('claimOnlyCurrentUserHint')}
          </div>
        </div>

        <div className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
          {t('shares')}: {totalShares}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="text-xs text-[var(--muted-foreground)]">
            {t('claimUserId')}
          </div>
          <div className="mt-2 break-all text-xs font-medium text-[var(--foreground)]">
            {currentEnergyUserId}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="text-xs text-[var(--muted-foreground)]">KZTE</div>
          <div className="mt-2 text-sm font-semibold text-[var(--foreground)]">
            {kzteShares} {t('shares')}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="text-xs text-[var(--muted-foreground)]">
            ENERGY_POINTS
          </div>
          <div className="mt-2 text-sm font-semibold text-[var(--foreground)]">
            {energyPointsShares} {t('shares')}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <JudgeClaimButton
          energyUserId={currentEnergyUserId}
          assetId={asset.assetId}
          epochIndex={epoch.epochIndex}
          estimatedKzteAmount={kzteShares * epoch.amountPerShareKzte}
          estimatedEnergyPointsAmount={
            energyPointsShares * epoch.amountPerShareKzte
          }
          kzteShares={kzteShares}
          energyPointsShares={energyPointsShares}
          alreadyClaimed={alreadyClaimed}
        />
      </div>
    </div>
  );
}