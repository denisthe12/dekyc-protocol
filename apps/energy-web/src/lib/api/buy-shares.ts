import { ENERGY_API_BASE_URL } from '@/lib/config';

export async function buyDemoShares(params: {
  energyUserId: string;
  assetId: string;
  shareAmount: number;
  payoutMode: 'KZTE' | 'ENERGY_POINTS';
}) {
  const response = await fetch(`${ENERGY_API_BASE_URL}/energy/buy-demo-shares`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      energyUserId: params.energyUserId,
      assetId: params.assetId,
      shareAmount: params.shareAmount,
      payoutMode: params.payoutMode,
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to buy shares: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as {
    assetId: string;
    assetPda: string;
    tx: string;
  };
}