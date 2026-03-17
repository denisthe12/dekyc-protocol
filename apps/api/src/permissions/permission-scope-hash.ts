import { createHash } from 'crypto';

export function normalizeScopes(scopes: string[]): string[] {
  return [...new Set(scopes.map((s) => s.trim()).filter(Boolean))].sort();
}

export function computeScopesHash(scopes: string[]): string {
  const normalized = normalizeScopes(scopes);
  return createHash('sha256')
    .update(JSON.stringify(normalized))
    .digest('hex');
}