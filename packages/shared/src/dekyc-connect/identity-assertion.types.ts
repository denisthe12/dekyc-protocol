export type DeKycVerificationStatus =
  | 'verified'
  | 'pending'
  | 'failed'
  | 'revoked';

export type DeKycAssuranceLevel =
  | 'mock_biometric_eds'
  | 'biometric_eds'
  | 'eds_only'
  | 'manual_review';

export type DeKycConsentStatus =
  | 'active'
  | 'expired'
  | 'revoked';

export type DeKycClaimKey =
  | 'fullName'
  | 'iin'
  | 'birthDate'
  | 'email'
  | 'verified'
  | 'age18Plus';

export type DeKycIdentityAssertionAlgorithm =
  | 'HS256'
  | 'RS256'
  | 'EdDSA';

export interface DeKycIdentityAssertionPayload {
  iss: string;
  aud: string;
  assertionId: string;
  subjectId: string;
  serviceSubjectId: string;
  serviceId: string;
  verificationStatus: DeKycVerificationStatus;
  verificationTime: string;
  kycProvider: string;
  assuranceLevel: DeKycAssuranceLevel;
  consentId: string;
  claimsScope: DeKycClaimKey[];
  revocationStatus: DeKycConsentStatus;
  iat: number;
  exp: number;
}

export interface DeKycIdentityAssertionDto {
  assertionJws: string;
  payload: DeKycIdentityAssertionPayload;
  algorithm: DeKycIdentityAssertionAlgorithm;
}

export interface DeKycVerifyAssertionRequestDto {
  assertionJws: string;
}

export interface DeKycVerifyAssertionResponseDto {
  valid: boolean;
  reason: string | null;
  payload: DeKycIdentityAssertionPayload | null;
}