import { ENERGY_API_BASE_URL } from '@/lib/config';

export type AssetAccessResponse = {
  assetId: string;
  energyUserId: string;
  hasAccess: boolean;
  status: 'GRANTED' | 'REVOKED' | null;
};

export async function fetchAssetAccess(
  assetId: string,
  accessToken: string,
): Promise<AssetAccessResponse> {
  const response = await fetch(`${ENERGY_API_BASE_URL}/asset-access/${assetId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch asset access: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as AssetAccessResponse;
}

export async function requestAssetAccess(
  assetId: string,
  accessToken: string,
): Promise<AssetAccessResponse> {
  const response = await fetch(`${ENERGY_API_BASE_URL}/asset-access/${assetId}/request`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to request asset access: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as AssetAccessResponse;
}