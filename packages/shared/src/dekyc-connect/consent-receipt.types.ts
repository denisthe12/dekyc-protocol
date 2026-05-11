import type { DeKycClaimKey, DeKycConsentStatus } from './identity-assertion.types';

export interface DeKycConsentReceiptDto {
  consentId: string;
  serviceId: string;
  subjectId: string;
  serviceSubjectId: string;
  grantedClaims: DeKycClaimKey[];
  consentTextVersion: string;
  grantedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  receiptHash: string;
  signature: string;
  status: DeKycConsentStatus;
}

export interface DeKycConsentStatusDto {
  consentId: string;
  serviceId: string;
  subjectId: string;
  serviceSubjectId: string;
  status: DeKycConsentStatus;
  grantedClaims: DeKycClaimKey[];
  grantedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
}

export interface DeKycRevokeConsentRequestDto {
  reason?: string;
}

export interface DeKycRevokeConsentResponseDto {
  consentId: string;
  status: Extract<DeKycConsentStatus, 'revoked'>;
  revokedAt: string;
}