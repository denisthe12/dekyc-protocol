import { ENERGY_API_BASE_URL } from '@/lib/config';

export async function fetchActionPasswordStatus(
  accessToken: string,
): Promise<{ isSet: boolean }> {
  const response = await fetch(
    `${ENERGY_API_BASE_URL}/settings/action-password/status`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Failed to fetch action password status: ${response.status} ${rawText}`,
    );
  }

  return JSON.parse(rawText) as { isSet: boolean };
}

export async function setActionPassword(params: {
  accessToken: string;
  password: string;
}): Promise<{ ok: boolean }> {
  const response = await fetch(`${ENERGY_API_BASE_URL}/settings/action-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify({
      password: params.password,
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to set action password: ${response.status} ${rawText}`);
  }

  return JSON.parse(rawText) as { ok: boolean };
}

export async function verifyActionPassword(params: {
  accessToken: string;
  password: string;
}): Promise<{ valid: true }> {
  const response = await fetch(
    `${ENERGY_API_BASE_URL}/settings/action-password/verify`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.accessToken}`,
      },
      body: JSON.stringify({
        password: params.password,
      }),
    },
  );

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Failed to verify action password: ${response.status} ${rawText}`,
    );
  }

  return JSON.parse(rawText) as { valid: true };
}