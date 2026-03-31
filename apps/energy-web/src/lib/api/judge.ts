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
    metadataCanonicalJson: string;
    createAssetTx: string | null;
    issueSharesTx: string | null;
    createdAt: string;
  }>;
  positions: Array<{
    id: string;
    energyUserId: string;
    assetId: string;
    totalSharesPurchased: number;
    totalKzteSpent: number;
    averagePricePerShare: number;
    buyerShareAccount: string;
    lastPurchaseTx: string | null;
    updatedAt: string;
  }>;
  epochs: Array<{
    id: string;
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
    claimReceiptPda: string;
    claimedAmountKzte: number;
    claimTx: string | null;
    createdAt: string;
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