import type { DeKycClaimKey } from '@energy/shared';

export class ApproveAuthorizationSessionDto {
  approvedClaims?: DeKycClaimKey[] | string;
  consentTextVersion?: string;
  consentExpiresInSeconds?: number;
}