async function importHmacKey(secret: string) {
  const encoder = new TextEncoder();

  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

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

export async function verifyServiceEnvelopeSignature(input: {
  responseSigningSecret: string;
  payload: unknown;
  timestamp: number;
  nonce: string;
  signature: string | null;
}) {
  if (!input.signature) {
    return {
      ok: false,
      computedSignature: null,
      canonical: canonicalizeSignedEnvelope({
        payload: input.payload,
        timestamp: input.timestamp,
        nonce: input.nonce,
      }),
      reason: 'missing_signature',
    };
  }

  const canonical = canonicalizeSignedEnvelope({
    payload: input.payload,
    timestamp: input.timestamp,
    nonce: input.nonce,
  });

  const key = await importHmacKey(input.responseSigningSecret);
  const encoder = new TextEncoder();

  const signed = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(canonical),
  );

  const computedSignature = toHex(signed);
  const ok = computedSignature === input.signature;

  return {
    ok,
    computedSignature,
    canonical,
    reason: ok ? 'signature_valid' : 'signature_mismatch',
  };
}