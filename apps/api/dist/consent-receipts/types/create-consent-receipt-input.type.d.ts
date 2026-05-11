import type { DeKycClaimKey } from '@energy/shared';
export interface CreateConsentReceiptInput {
    userId: string;
    serviceId: string;
    grantedClaims: DeKycClaimKey[];
    consentTextVersion: string;
    expiresAt?: Date | null;
}
