import { ENERGY_API_BASE_URL } from '@/lib/config';

export type RevenueEpochItem = {
  id: string;
  energyAssetId: string;
  epochIndex: number;
  revenueEpochPda: string;
  treasuryKzteAccount: string;
  totalAmountKzte: number;
  amountPerShareKzte: number;
  totalSharesSnapshot: number;
  createEpochTx: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type PayoutClaimItem = {
  id: string;
  energyUserId: string;
  energyAssetId: string;
  energyRevenueEpochId: string;
  claimReceiptPda: string;
  claimerWalletAddress: string;
  claimerKzteAccount: string;
  claimerShareAccount: string;
  claimedAmountKzte: number;
  claimTx: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchEpochs(assetId: string): Promise<RevenueEpochItem[]> {
  const response = await fetch(`${ENERGY_API_BASE_URL}/payouts/epochs/${assetId}`, {
    method: 'GET',
    cache: 'no-store',
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch epochs: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as RevenueEpochItem[];
}

export async function fetchClaims(params: {
  energyUserId: string;
  assetId?: string;
}): Promise<PayoutClaimItem[]> {
  const query = params.assetId
    ? `?assetId=${encodeURIComponent(params.assetId)}`
    : '';

  const response = await fetch(
    `${ENERGY_API_BASE_URL}/payouts/claims/${params.energyUserId}${query}`,
    {
      method: 'GET',
      cache: 'no-store',
    },
  );

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch claims: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as PayoutClaimItem[];
}

export async function claimPayout(params: {
  energyUserId: string;
  assetId: string;
  epochIndex: number;
}) {
  const response = await fetch(`${ENERGY_API_BASE_URL}/payouts/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Claim failed: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as {
    assetId: string;
    epochIndex: number;
    claimReceiptPda: string;
    claimedAmountKzte: number;
    tx: string;
  };
}