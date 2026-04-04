import { ENERGY_API_BASE_URL } from '@/lib/config';

export type AssetDocumentItem = {
  id: string;
  energyAssetId: string;
  documentType: string;
  fileName: string;
  mimeType: string;
  storageKey: string;
  fileUrl: string;
  sha256Hash: string;
  sizeBytes: number;
  uploadedByEnergyUserId: string | null;
  createdAt: string;
};

export type AssetProofBundleItem = {
  id: string;
  energyAssetId: string;
  bundleVersion: number;
  proofRootHash: string;
  manifestJson: Record<string, unknown>;
  createdByEnergyUserId: string | null;
  createdAt: string;
};

export type AssetDetailResponse = {
  accessLevel: 'PREVIEW' | 'FULL';
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
  proofRootHash: string;
  metadataUriHash: string;
  assetPda: string;
  registryPda: string;
  shareMintAddress: string;
  treasuryShareAccount: string;
  treasuryKzteAccount: string | null;
  createAssetTx: string | null;
  issueSharesTx: string | null;
  metadataJson: Record<string, unknown> | null;
  documents?: AssetDocumentItem[];
  latestProofBundle?: AssetProofBundleItem | null;
};

export async function fetchPublicAssetDetail(
  assetId: string,
): Promise<AssetDetailResponse> {
  const response = await fetch(`${ENERGY_API_BASE_URL}/public/assets/${assetId}`, {
    method: 'GET',
    cache: 'no-store',
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch public asset detail: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as AssetDetailResponse;
}

export async function fetchPrivateAssetDetail(
  assetId: string,
  accessToken: string,
): Promise<AssetDetailResponse> {
  const response = await fetch(`${ENERGY_API_BASE_URL}/assets/${assetId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch private asset detail: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as AssetDetailResponse;
}