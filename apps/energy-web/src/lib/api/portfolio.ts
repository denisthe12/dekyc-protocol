import { ENERGY_API_BASE_URL } from '@/lib/config';

export type PortfolioPosition = {
  id: string;
  energyUserId: string;
  energyAssetId: string;
  assetId: string;
  assetPda: string;
  shareMintAddress: string;
  buyerWalletAddress: string;
  buyerKzteAccount: string | null;
  buyerShareAccount: string;
  totalSharesPurchased: number;
  totalKzteSpent: number;
  averagePricePerShare: number;
  payoutMode: "KZTE" | "ENERGY_POINTS";
  lastPurchaseTx: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export async function fetchPortfolio(
  energyUserId: string,
): Promise<PortfolioPosition[]> {
  const response = await fetch(
    `${ENERGY_API_BASE_URL}/energy/portfolio/${energyUserId}`,
    {
      method: 'GET',
      cache: 'no-store',
    },
  );

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch portfolio: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as PortfolioPosition[];
}