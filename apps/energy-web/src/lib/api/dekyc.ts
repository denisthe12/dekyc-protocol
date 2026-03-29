import { DEKYC_API_BASE_URL, DEFAULT_REQUESTED_CLAIMS } from '@/lib/config';
import { SignedEnvelope } from '@/lib/types/dekyc';

export async function loginViaDekyc(params: {
  serviceClientId: string;
  serviceClientSecret: string;
  biometricMockId: string;
  loginCode: string;
}): Promise<SignedEnvelope> {
  const timestamp = Date.now();
  const nonce = `energy-login-${timestamp}`;

  const response = await fetch(`${DEKYC_API_BASE_URL}/service-auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': params.serviceClientId,
      'x-client-secret': params.serviceClientSecret,
      'x-timestamp': String(timestamp),
      'x-nonce': nonce,
    },
    body: JSON.stringify({
      biometricMockId: params.biometricMockId,
      loginCode: params.loginCode,
      requestedClaims: DEFAULT_REQUESTED_CLAIMS,
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`DeKYC login failed: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as SignedEnvelope;
}