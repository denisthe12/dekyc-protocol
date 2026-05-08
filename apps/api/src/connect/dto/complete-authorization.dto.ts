import type { DeKycClaimKey } from '@energy/shared';

export class CompleteAuthorizationDto {
  clientId!: string;
  redirectUri!: string;
  scope!: DeKycClaimKey[] | string;

  userId?: string;
  userEmail?: string;

  state?: string;
  nonce?: string;
  consentTextVersion?: string;
  consentExpiresInSeconds?: number;
}