export interface ParsedCertificateInfo {
  subjectString: string;
  issuerString: string;
  serialNumberHex: string;
  notBefore: string;
  notAfter: string;
  fingerprintSha256: string;
  subjectCommonName: string | null;
  subjectOrganization: string | null;
  subjectOrgUnit: string | null;
  subjectCountry: string | null;
  probableIin: string | null;
}

export interface StoredChallenge {
  challengeId: string;
  challengeBase64: string;
  expiresAt: number;
}