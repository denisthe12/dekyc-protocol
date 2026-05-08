import type {
  DeKycClaimKey,
  DeKycIdentityAssertionDto,
} from './identity-assertion.types';
import type { DeKycConsentReceiptDto } from './consent-receipt.types';

export type DeKycConnectResponseType = 'code';
export type DeKycConnectGrantType = 'authorization_code';

export interface DeKycAuthorizeQueryDto {
  clientId: string;
  redirectUri: string;
  responseType: DeKycConnectResponseType;
  scope: DeKycClaimKey[];
  state?: string;
  nonce?: string;
}

export interface DeKycTokenRequestDto {
  grantType: DeKycConnectGrantType;
  code: string;
  redirectUri: string;
  clientId: string;
}

export interface DeKycTokenResponseDto {
  tokenType: 'dekyc_identity_assertion';
  expiresIn: number;
  identityAssertion: DeKycIdentityAssertionDto;
  consentReceipt: DeKycConsentReceiptDto;
  minimalClaims: Partial<Record<DeKycClaimKey, string | boolean>>;
}