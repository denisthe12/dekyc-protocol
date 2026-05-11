'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  CreateEpochDialog,
  JudgeAssetOption,
} from '@/components/judge/create-epoch-dialog';
import { fetchAssets } from '@/lib/api/assets';
import { useRouter } from 'next/navigation';

export function JudgeEpochControls() {
  const t = useTranslations('JudgePage');
  const router = useRouter();

  const [epochDialogOpen, setEpochDialogOpen] = useState(false);
  const [assets, setAssets] = useState<JudgeAssetOption[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  useEffect(() => {
    void loadAssets();
  }, []);

  async function loadAssets(): Promise<void> {
    try {
      setLoadingAssets(true);

      const data = await fetchAssets();
      setAssets(
        data.map((asset) => ({
          assetId: asset.assetId,
          title: asset.title,
          totalShares: asset.totalShares,
          pricePerShareKzte: asset.pricePerShareKzte,
        })),
      );
    } finally {
      setLoadingAssets(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setEpochDialogOpen(true)}
        className="rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={loadingAssets || assets.length === 0}
      >
        {t('createEpochButton')}
      </button>

      <CreateEpochDialog
        open={epochDialogOpen}
        onClose={() => setEpochDialogOpen(false)}
        assets={assets}
        onSuccess={async () => {
          await loadAssets();
          router.refresh();
        }}
      />
    </>
  );
}