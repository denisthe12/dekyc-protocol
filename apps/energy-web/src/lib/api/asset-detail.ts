import { fetchAssets, EnergyAssetListItem } from '@/lib/api/assets';

export async function fetchAssetById(assetId: string): Promise<EnergyAssetListItem | null> {
  const assets = await fetchAssets();
  return assets.find((item) => item.assetId === assetId) ?? null;
}