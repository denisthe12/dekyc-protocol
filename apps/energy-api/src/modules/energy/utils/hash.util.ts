import { createHash } from 'crypto';
import { toCanonicalJson } from './canonical-json.util';

export function sha256FromObject(input: unknown): Buffer {
  const canonicalJson = toCanonicalJson(input);
  return createHash('sha256').update(canonicalJson).digest();
}

export function sha256HexFromObject(input: unknown): string {
  const canonicalJson = toCanonicalJson(input);
  return createHash('sha256').update(canonicalJson).digest('hex');
}