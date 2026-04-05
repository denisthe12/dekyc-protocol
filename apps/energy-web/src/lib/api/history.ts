import { ENERGY_API_BASE_URL } from '@/lib/config';

export type HistoryEventType =
  | 'PRIMARY_BUY'
  | 'OTC_LISTING_CREATED'
  | 'OTC_LISTING_FILLED'
  | 'CLAIM';

export type HistoryItem = {
  id: string;
  type: HistoryEventType;
  assetId: string;
  title: string;
  payoutMode: 'KZTE' | 'ENERGY_POINTS' | null;
  amountBaseUnits: number | null;
  shareAmount: number | null;
  tx: string | null;
  secondaryTx: string | null;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
};

export async function fetchHistory(energyUserId: string): Promise<HistoryItem[]> {
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