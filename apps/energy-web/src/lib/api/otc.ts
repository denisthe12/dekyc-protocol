import { ENERGY_API_BASE_URL } from '@/lib/config';

export type OtcListingItem = {
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

export async function fetchOtcListings(): Promise<OtcListingItem[]> {
  const response = await fetch(`${ENERGY_API_BASE_URL}/otc/listings`, {
    method: 'GET',
    cache: 'no-store',
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch OTC listings: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as OtcListingItem[];
}

export async function fillOtcListing(params: {
  energyUserId: string;
  listingId: string;
}) {
  const response = await fetch(`${ENERGY_API_BASE_URL}/otc/fill-demo-listing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fill OTC listing: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as {
    buyerWallet: string;
    buyerShareAccount: string;
    tx: string;
    db?: OtcListingItem;
  };
}

export async function createOtcListing(params: {
  energyUserId: string;
  assetId: string;
  shareAmount: number;
  pricePerShareKzte: number;
  payoutMode: 'KZTE' | 'ENERGY_POINTS';
}) {
  const response = await fetch(`${ENERGY_API_BASE_URL}/otc/create-demo-listing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to create OTC listing: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as {
    listingPda: string;
    escrowShareAccount: string;
    tx: string;
    db?: OtcListingItem;
  };
}