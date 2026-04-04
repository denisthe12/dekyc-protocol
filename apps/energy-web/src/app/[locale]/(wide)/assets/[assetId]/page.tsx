import { AssetDetailView } from '@/components/assets/asset-detail-view';
import {
  fetchPrivateAssetDetail,
  fetchPublicAssetDetail,
} from '@/lib/api/asset-detail';
import { cookies } from 'next/headers';

type AssetDetailPageProps = {
  params: Promise<{
    assetId: string;
    locale: string;
  }>;
};

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { assetId } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('energy_access_token')?.value ?? null;

  let asset;

  try {
    asset = accessToken
      ? await fetchPrivateAssetDetail(assetId, accessToken)
      : await fetchPublicAssetDetail(assetId);
  } catch {
    asset = await fetchPublicAssetDetail(assetId);
  }

  return <AssetDetailView asset={asset} />;
}