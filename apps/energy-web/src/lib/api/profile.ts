import { ENERGY_API_BASE_URL } from '@/lib/config';

export type ProfileResponse = {
  user: {
    id: string;
    dekycUserId: string;
    fullName: string | null;
    email: string | null;
    iin: string | null;
    createdAt: string;
  };
  wallet: {
    custodialWalletAddress: string | null;
    kzteTokenAccountAddress: string | null;
    energyPointsTokenAccountAddress: string | null;
  } | null;
  balances: {
    kzte: {
      amountBaseUnits: string;
      decimals: number;
    };
    energyPoints: {
      amountBaseUnits: string;
      decimals: number;
    };
  };
  security: {
    actionPasswordIsSet: boolean;
  };
};

export async function fetchProfile(accessToken: string): Promise<ProfileResponse> {
  const response = await fetch(`${ENERGY_API_BASE_URL}/users/me/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as ProfileResponse;
}