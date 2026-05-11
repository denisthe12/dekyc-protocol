import type { DeKycClaimKey, DeKycConsentStatus } from '@energy/shared';
export interface ConsentReceiptSignablePayload {
    consentId: string;
    serviceId: string;
    subjectId: string;
    serviceSubjectId: string;
    grantedClaims: DeKycClaimKey[];
    consentTextVersion: string;
    grantedAt: string;
    expiresAt: string | null;
    revokedAt: string | null;
    status: DeKycConsentStatus;
}
