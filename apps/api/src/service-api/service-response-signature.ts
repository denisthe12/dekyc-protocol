import { createHmac } from 'crypto';

export function canonicalizeSignedEnvelope(input: {
  payload: unknown;
  timestamp: number;
  nonce: string;
}) {
  return JSON.stringify({
    payload: input.payload,
    meta: {
      timestamp: input.timestamp,
      nonce: input.nonce,
    },
  });
}

export function signServiceResponse(input: {
  responseSigningSecret: string;
  payload: unknown;
  timestamp: number;
  nonce: string;
}) {
  const canonical = canonicalizeSignedEnvelope({
    payload: input.payload,
    timestamp: input.timestamp,
    nonce: input.nonce,
  });

  const signature = createHmac('sha256', input.responseSigningSecret)
    .update(canonical)
    .digest('hex');

  return {
    canonical,
    signature,
  };
}