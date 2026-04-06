import { createNCALayerClient } from "../ncalayer";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

function getAccessToken() {
  const token = window.localStorage.getItem('dekyc_access_token');

  if (!token) {
    throw new Error('Platform session not found. Please login again.');
  }

  return token;
}

async function authedFetch(path: string, init?: RequestInit) {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`${response.status}: ${rawText}`);
  }

  return rawText ? JSON.parse(rawText) : null;
}

export type RunPlatformEdsFlowResult = {
  challenge: {
    challengeId: string;
    challengeBase64: string;
    expiresAt?: string;
  };
  attestResult: unknown;
  analyzeResult?: unknown;
};

export async function runPlatformEdsFlow(): Promise<RunPlatformEdsFlowResult> {
  const challenge = await authedFetch('/eds/challenge', {
    method: 'POST',
  });

    const ncalayerClient = createNCALayerClient();

    await ncalayerClient.connect();

    const cmsSignature = await ncalayerClient.basicsSignCMS(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ncalayerClient.constructor as any).basicsStorageAll,
    challenge.challengeBase64,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ncalayerClient.constructor as any).basicsCMSParamsDetached,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ncalayerClient.constructor as any).basicsSignerSignAny,
    );

  const attestResult = await authedFetch('/eds/attest', {
    method: 'POST',
    body: JSON.stringify({
        challengeId: challenge.challengeId,
        challengeBase64: challenge.challengeBase64,
        cmsSignatureBase64: cmsSignature,
    }),
  });

  let analyzeResult: unknown = null;

  try {
    analyzeResult = await authedFetch('/eds/analyze', {
      method: 'POST',
      body: JSON.stringify({
        challengeId: challenge.challengeId,
        challengeBase64: challenge.challengeBase64,
        cmsSignature,
      }),
    });
  } catch {
    analyzeResult = null;
  }

  return {
    challenge,
    attestResult,
    analyzeResult: analyzeResult ?? undefined,
  };
}