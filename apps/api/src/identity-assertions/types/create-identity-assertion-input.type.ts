import type {
  DeKycAssuranceLevel,
  DeKycClaimKey,
  DeKycVerificationStatus,
} from '@energy/shared';

export interface CreateIdentityAssertionInput {
  userId: string;
  serviceId: string;
  consentId: string;
  claimsScope: DeKycClaimKey[];
  verificationStatus?: DeKycVerificationStatus;
  assuranceLevel?: DeKycAssuranceLevel;
  kycProvider?: string;
}