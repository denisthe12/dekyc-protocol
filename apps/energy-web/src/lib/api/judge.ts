import { ENERGY_API_BASE_URL } from '@/lib/config';

export type JudgeSummary = {
  generatedAt: string;
  solana: {
    rpcUrl: string;
    signerAddress: string;
    signerBalanceSol: number;
    tokenizationProgramId: string;
  };
  kzte: {
    exists: boolean;
    mintAddress: string | null;
    decimals: number | null;
    supply: string | null;
    tokenProgram: string;
  };
  users: Array<{
    id: string;
    dekycUserId: string;
    email: string | null;
    fullName: string | null;
    role: string;
    createdAt: string;
    wallet: {
      custodialWalletAddress: string;
      kzteTokenAccountAddress: string | null;
      walletStatus: string;
      initialKzteAirdropped: boolean;
      initialKzteAirdropTx: string | null;
    } | null;
  }>;
  assets: Array<{
    id: string;
    assetId: string;
    title: string;
    assetType: string;
    totalShares: number;
    pricePerShareKzte: number;
    status: string;
    assetPda: string;
    shareMintAddress: string;
    treasuryShareAccount: string;
    treasuryKzteAccount: string;
    metadataUriHash: string;
    metadataJson: Record<string, unknown> | null;
    metadataCanonicalJson: string;
    createAssetTx: string | null;
    issueSharesTx: string | null;
    createdAt: string;
  }>;
  positions: Array<{
    id: string;
    energyUserId: string;
    energyAssetId: string;
    assetId: string;
    assetPda: string;
    shareMintAddress: string;
    buyerWalletAddress: string;
    buyerKzteAccount: string | null;
    buyerShareAccount: string;
    payoutMode: 'KZTE' | 'ENERGY_POINTS';
    totalSharesPurchased: number;
    totalKzteSpent: number;
    averagePricePerShare: number;
    lastPurchaseTx: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  epochs: Array<{
    id: string;
    energyAssetId: string;
    epochIndex: number;
    revenueEpochPda: string;
    totalAmountKzte: number;
    amountPerShareKzte: number;
    totalSharesSnapshot: number;
    createEpochTx: string | null;
    createdAt: string;
  }>;
  claims: Array<{
    id: string;
    energyUserId: string;
    energyAssetId: string;
    energyRevenueEpochId: string;
    claimReceiptPda: string;
    claimerWalletAddress: string;
    claimerKzteAccount: string;
    claimerShareAccount: string;
    claimedAmountKzte: number;
    claimedAmountEnergyPoints: number;
    payoutMode: 'KZTE' | 'ENERGY_POINTS';
    claimTx: string | null;
    energyPointsMintTx: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  otcListings: JudgeOtcListingItem[];
};

export type JudgeOtcListingItem = {
  id: string;
  listingId: string;
  energyAssetId: string;
  sellerEnergyUserId: string;
  buyerEnergyUserId: string | null;
  assetId: string;
  assetPda: string;
  listingPda: string;
  shareMintAddress: string;
  sellerWalletAddress: string;
  sellerShareAccount: string;
  sellerKzteAccount: string;
  escrowShareAccount: string;
  shareAmount: number;
  pricePerShareKzte: number;
  totalPriceKzte: number;
  payoutMode: 'KZTE' | 'ENERGY_POINTS';
  createListingTx: string | null;
  fillListingTx: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type JudgeCreateEpochResponse = {
  assetId: string;
  epochIndex: number;
  revenueEpochPda: string;
  createEpochTx: string;
  db: {
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
};

export type JudgeClaimPayoutResponse = {
  assetId: string;
  epochIndex: number;
  totalKzteClaimAmount: number;
  totalEnergyPointsClaimAmount: number;
  claims: Array<{
    investorPositionPda: string;
    claimReceiptPda: string;
    claimAmount: number;
    payoutMode: 'KZTE' | 'ENERGY_POINTS';
    tx: string;
    energyPointsMintTx: string | null;
  }>;
};

export async function fetchJudgeSummary(): Promise<JudgeSummary> {
  const response = await fetch(`${ENERGY_API_BASE_URL}/judge/summary`, {
    method: 'GET',
    cache: 'no-store',
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch judge summary: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as JudgeSummary;
}

export async function createRevenueEpoch(params: {
  assetId: string;
  totalAmountKzte: number;
}): Promise<JudgeCreateEpochResponse> {
  const response = await fetch(`${ENERGY_API_BASE_URL}/payouts/create-epoch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to create revenue epoch: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as JudgeCreateEpochResponse;
}

export async function claimPayout(params: {
  energyUserId: string;
  assetId: string;
  epochIndex: number;
}): Promise<JudgeClaimPayoutResponse> {
  const response = await fetch(`${ENERGY_API_BASE_URL}/payouts/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to claim payout: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as JudgeClaimPayoutResponse;
}