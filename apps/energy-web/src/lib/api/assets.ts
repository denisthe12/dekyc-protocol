import { ENERGY_API_BASE_URL } from '@/lib/config';

export type EnergyAssetListItem = {
  id: string;
  assetId: string;
  issuerEnergyUserId: string | null;
  title: string;
  description: string | null;
  location: string | null;
  assetType: string;
  totalShares: number;
  pricePerShareKzte: number;
  investorBps: number;
  operatorBps: number;
  payoutMode: 'KZTE' | 'ENERGY_POINTS' | string;
  status: string;
  assetPda: string;
  registryPda: string;
  shareMintAddress: string;
  treasuryShareAccount: string;
  treasuryKzteAccount?: string;
  proofRootHash: string;
  metadataUriHash: string;
  metadataJson: Record<string, unknown> | null;
  metadataCanonicalJson?: string | null;
  createAssetTx: string | null;
  issueSharesTx: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchAssets(): Promise<EnergyAssetListItem[]> {
  const response = await fetch(`${ENERGY_API_BASE_URL}/energy/assets`, {
    method: 'GET',
    cache: 'no-store',
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch assets: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as EnergyAssetListItem[];
}