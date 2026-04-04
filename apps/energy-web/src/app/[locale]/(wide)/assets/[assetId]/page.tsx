'use client';

import { useEffect, useState } from 'react';
import { AssetDetailView } from '@/components/assets/asset-detail-view';
import {
  fetchPrivateAssetDetail,
  fetchPublicAssetDetail,
  type AssetDetailResponse,
} from '@/lib/api/asset-detail';
import { loadEnergySession } from '@/lib/session';

type AssetDetailPageProps = {
  params: Promise<{
    assetId: string;
    locale: string;
  }>;
};

export default function AssetDetailPage({ params }: AssetDetailPageProps) {
  const [assetId, setAssetId] = useState<string>('');
  const [asset, setAsset] = useState<AssetDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadAsset(nextAssetId: string): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const session = loadEnergySession();

      try {
        const data = session?.accessToken
          ? await fetchPrivateAssetDetail(nextAssetId, session.accessToken)
          : await fetchPublicAssetDetail(nextAssetId);

        setAsset(data);
      } catch {
        const preview = await fetchPublicAssetDetail(nextAssetId);
        setAsset(preview);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load asset');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function resolveParamsAndLoad() {
      const resolved = await params;
      if (!isMounted) return;

      setAssetId(resolved.assetId);
      await loadAsset(resolved.assetId);
    }

    void resolveParamsAndLoad();

    return () => {
      isMounted = false;
    };
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)]">
        <div className="mx-auto flex w-full max-w-[1880px] flex-col gap-8">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 text-[var(--muted-foreground)] shadow-sm">
            Loading asset...
          </div>
        </div>
      </main>
    );
  }

  if (error || !asset) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)]">
        <div className="mx-auto flex w-full max-w-[1880px] flex-col gap-8">
          <div className="rounded-3xl border border-red-900 bg-red-950/40 p-10 text-red-300 shadow-sm">
            {error ?? `Asset ${assetId} not found`}
          </div>
        </div>
      </main>
    );
  }

  return (
    <AssetDetailView
      asset={asset}
      onRefresh={async () => {
        await loadAsset(asset.assetId);
      }}
    />
  );
}