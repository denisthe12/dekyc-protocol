export function encodeBase64Url(input: string | Buffer): string {
  const buffer = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;

  return buffer
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

export function decodeBase64Url(input: string): Buffer {
  const normalized = input.replaceAll('-', '+').replaceAll('_', '/');
  const paddingLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(paddingLength);

  return Buffer.from(padded, 'base64');
}

export function decodeBase64UrlJson<T>(input: string): T {
  const decoded = decodeBase64Url(input).toString('utf8');

  return JSON.parse(decoded) as T;
}