import { deriveFieldsFromIin } from './iin-derived-fields';
export type CertificateLabInput = {
  parsedNames: {
    subjectFields: Record<string, string>;
    issuerFields: Record<string, string>;
  };
  openssl: {
    email: string;
  };
  nodeX509: {
    enumerableSnapshot: {
      validFrom?: string;
      validTo?: string;
      fingerprint256?: string;
      serialNumber?: string;
      issuer?: string;
      subject?: string;
    };
  };
};

export type ExtractedCertificateIdentity = {
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  iin: string | null;
  email: string | null;

  birthDate: string | null;
  gender: 'male' | 'female' | null;
  birthCentury: number | null;

  certificateSerialNumber: string | null;
  certificateFingerprint256: string | null;
  certificateValidFrom: string | null;
  certificateValidTo: string | null;
  certificateIssuer: string | null;
  certificateSubject: string | null;

  rawSubjectFields: Record<string, string>;
  rawIssuerFields: Record<string, string>;
};

export function extractCertificateIdentity(
  lab: CertificateLabInput,
): ExtractedCertificateIdentity {
  const subjectFields = lab.parsedNames?.subjectFields ?? {};
  const issuerFields = lab.parsedNames?.issuerFields ?? {};
  const snapshot = lab.nodeX509?.enumerableSnapshot ?? {};

  const cn = subjectFields['CN'] ?? null;
  const sn = subjectFields['SN'] ?? null;
  const gn = subjectFields['GN'] ?? null;
  const serialNumberField = subjectFields['serialNumber'] ?? null;

  const iin = extractIinFromSubjectSerial(serialNumberField);
  const email = normalizeEmail(lab.openssl?.email ?? null);

  const fullName = cn;
  const lastName = sn;
  const middleName = gn;
  const firstName = extractFirstNameFromCn(cn, sn);

  const derived = deriveFieldsFromIin(iin);

  return {
    fullName,
    firstName,
    lastName,
    middleName,
    iin,
    email,

    birthDate: derived.birthDate,
    gender: derived.gender,
    birthCentury: derived.birthCentury,

    certificateSerialNumber: toNullableString(snapshot.serialNumber),
    certificateFingerprint256: toNullableString(snapshot.fingerprint256),
    certificateValidFrom: toNullableString(snapshot.validFrom),
    certificateValidTo: toNullableString(snapshot.validTo),
    certificateIssuer: toNullableString(snapshot.issuer),
    certificateSubject: toNullableString(snapshot.subject),

    rawSubjectFields: subjectFields,
    rawIssuerFields: issuerFields,
  };
}

function extractIinFromSubjectSerial(value: string | null): string | null {
  if (!value) return null;

  const normalized = value.trim();

  const prefixed = normalized.match(/^IIN(\d{12})$/i);
  if (prefixed) return prefixed[1];

  const plain12 = normalized.match(/\b(\d{12})\b/);
  if (plain12) return plain12[1];

  return null;
}

function extractFirstNameFromCn(
  cn: string | null,
  lastName: string | null,
): string | null {
  if (!cn) return null;

  const normalizedCn = cn.trim();

  if (!lastName) {
    const parts = normalizedCn.split(/\s+/).filter(Boolean);
    return parts.length >= 2 ? parts[1] : null;
  }

  const escapedLastName = escapeRegex(lastName.trim());
  const regex = new RegExp(`^${escapedLastName}\\s+(.+)$`, 'i');
  const match = normalizedCn.match(regex);

  if (match?.[1]) {
    return match[1].trim();
  }

  const parts = normalizedCn.split(/\s+/).filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 1] : null;
}

function normalizeEmail(value: string | null): string | null {
  if (!value) return null;

  const email = value.trim();
  return email.length > 0 ? email : null;
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}