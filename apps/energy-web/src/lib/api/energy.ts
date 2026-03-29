import { ENERGY_API_BASE_URL } from '@/lib/config';
import { EnergySession } from '@/lib/types/dekyc';

export async function createEnergySessionViaDekyc(params: {
  biometricMockId: string;
  loginCode: string;
  requestedClaims?: string[];
}): Promise<EnergySession> {
  const response = await fetch(`${ENERGY_API_BASE_URL}/auth/dekyc-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      biometricMockId: params.biometricMockId,
      loginCode: params.loginCode,
      requestedClaims: params.requestedClaims,
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Energy login failed: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as EnergySession;
}

export async function fetchEnergyMe(accessToken: string) {
  const response = await fetch(`${ENERGY_API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch me: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as {
    id: string;
    dekycUserId: string;
    email: string | null;
    fullName: string | null;
    role: string;
  };
}