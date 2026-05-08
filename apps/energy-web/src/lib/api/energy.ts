import {
  DEFAULT_REQUESTED_CLAIMS,
  DEKYC_API_BASE_URL,
  DEKYC_CLIENT_ID,
  ENERGY_API_BASE_URL,
} from '@/lib/config';
import { EnergySession } from '@/lib/types/dekyc';


type DekycConnectAuthorizeResponse = {
  sessionId: string;
  status: 'pending';
  service: {
    id: string;
    name: string;
    clientId: string;
    description: string | null;
    category: string | null;
  };
  authorizationRequest: {
    responseType: 'code';
    clientId: string;
    redirectUri: string;
    scope: string[];
    state: string | null;
    nonce: string | null;
  };
  platformConsentUrl: string;
  expiresAt: string;
};

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

export function buildDekycConnectRedirectUri(locale: string): string {
  if (typeof window === 'undefined') {
    throw new Error('Redirect URI can be built only in browser');
  }

  return `${window.location.origin}/${locale}/dekyc-connect/callback`;
}

export async function startDekycConnectAuthorization(params: {
  locale: string;
  state?: string;
  nonce?: string;
}): Promise<DekycConnectAuthorizeResponse> {
  if (!DEKYC_CLIENT_ID) {
    throw new Error('NEXT_PUBLIC_DEKYC_CLIENT_ID is not configured');
  }

  if (typeof window === 'undefined') {
    throw new Error('DeKYC Connect authorization can be started only in browser');
  }

  const redirectUri = buildDekycConnectRedirectUri(params.locale);
  const url = new URL(`${DEKYC_API_BASE_URL}/connect/authorize`);

  url.searchParams.set('client_id', DEKYC_CLIENT_ID);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', DEFAULT_REQUESTED_CLAIMS.join(' '));

  if (params.state) {
    url.searchParams.set('state', params.state);
  }

  if (params.nonce) {
    url.searchParams.set('nonce', params.nonce);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    cache: 'no-store',
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`DeKYC Connect authorize failed: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as DekycConnectAuthorizeResponse;
}

export async function createEnergySessionViaDekycConnect(params: {
  code: string;
  redirectUri: string;
}): Promise<EnergySession> {
  const response = await fetch(`${ENERGY_API_BASE_URL}/auth/dekyc-connect/exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: params.code,
      redirectUri: params.redirectUri,
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Energy DeKYC Connect exchange failed: ${response.status} ${rawText}`);
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
    profile: {
      iin: string | null;
      birthDate: string | null;
      verified: boolean;
      age18Plus: boolean;
    } | null;
    wallet: {
      custodialWalletAddress: string;
      kzteTokenAccountAddress: string | null;
      energyPointsAccountAddress: string | null;
      walletStatus: string;
      initialKzteAirdropped: boolean;
      initialKzteAirdropTx: string | null;
    } | null;
  };
}