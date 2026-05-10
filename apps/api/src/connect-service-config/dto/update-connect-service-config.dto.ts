import type { DeKycClaimKey } from '@energy/shared';

export class UpdateConnectServiceConfigDto {
  allowedRedirectUris?: string[];
  allowedScopes?: DeKycClaimKey[];
  assertionAudience?: string;
  webhookSigningMode?: 'shared_secret';
  consentTextVersion?: string;
  environment?: 'sandbox' | 'staging' | 'production';
}