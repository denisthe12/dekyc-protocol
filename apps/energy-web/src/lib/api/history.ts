import { ENERGY_API_BASE_URL } from '@/lib/config';

export type HistoryItem = {
  id: string;
  type:
    | 'INITIAL_KZTE_AIRDROP'
    | 'PRIMARY_BUY'
    | 'REVENUE_EPOCH_CREATED'
    | 'PAYOUT_CLAIM'
    | 'OTC_LISTING_CREATED'
    | 'OTC_LISTING_FILLED';
  title: string;
  description: string;
  assetId: string | null;
  txSignature: string | null;
  createdAt: string;
};

export async function fetchHistory(
  energyUserId: string,
): Promise<HistoryItem[]> {
  const response = await fetch(`${ENERGY_API_BASE_URL}/history/${energyUserId}`, {
    method: 'GET',
    cache: 'no-store',
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as HistoryItem[];
}