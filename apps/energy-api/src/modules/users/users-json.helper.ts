import { Prisma } from '../../../prisma/generated/client';

type JsonPrimitive = string | number | boolean | null;
type JsonLike = JsonPrimitive | JsonLike[] | { [key: string]: JsonLike };

function isJsonLike(value: unknown): value is JsonLike {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonLike);
  }

  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).every(isJsonLike);
  }

  return false;
}

export function toPrismaJson(
  value: Record<string, unknown> | null | undefined,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return Prisma.JsonNull;
  }

  if (!isJsonLike(value)) {
    throw new Error('Claims contain non-JSON-serializable values');
  }

  return value as Prisma.InputJsonValue;
}