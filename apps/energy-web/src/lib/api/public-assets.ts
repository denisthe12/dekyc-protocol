import { ENERGY_API_BASE_URL } from '@/lib/config';

export type PublicAssetItem = {
  assetId: string;
  title: string;
  description: string | null;
  location: string | null;
  assetType: string;
  totalShares: number;
  soldShares: number;
  remainingShares: number;
  pricePerShareKzte: number;
  investorBps: number;
  operatorBps: number;
  status: string;
  coverImageUrl: string | null;
  metadataJson: Record<string, unknown> | null;
  supportedPayoutModes: Array<'KZTE' | 'ENERGY_POINTS' | string>;
};

export async function fetchPublicAssets(): Promise<PublicAssetItem[]> {
  const response = await fetch(`${ENERGY_API_BASE_URL}/public/assets`, {
    method: 'GET',
    cache: 'no-store',
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch public assets: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as PublicAssetItem[];
}