import type { DeKycClaimKey } from '@energy/shared';
export declare class ApproveAuthorizationSessionDto {
    approvedClaims?: DeKycClaimKey[] | string;
    consentTextVersion?: string;
    consentExpiresInSeconds?: number;
}
