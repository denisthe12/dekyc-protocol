import type { DeKycClaimKey } from '@energy/shared';
export interface ConnectAuthorizationSessionResponse {
    sessionId: string;
    status: string;
    service: {
        id: string;
        name: string;
        clientId: string;
        description: string | null;
        category: string | null;
    };
    authorizationRequest: {
        responseType: 'code';
        clientId: string;
        redirectUri: string;
        scope: DeKycClaimKey[];
        state: string | null;
        nonce: string | null;
    };
    platformConsentUrl: string;
    expiresAt: string;
}
export interface ConnectAuthorizationSessionDetailResponse {
    sessionId: string;
    status: string;
    service: {
        id: string;
        name: string;
        clientId: string;
        description: string | null;
        category: string | null;
    };
    requestedClaims: DeKycClaimKey[];
    redirectUri: string;
    state: string | null;
    nonce: string | null;
    expiresAt: string;
    existingPermission: {
        id: string;
        status: string;
        allowedClaims: string[];
    } | null;
}
export interface ConnectAuthorizationDecisionResponse {
    sessionId: string;
    status: 'approved' | 'rejected';
    redirectUri: string;
    redirectUriWithCode?: string;
    redirectUriWithError?: string;
    consentId?: string;
    serviceSubjectId?: string;
    permission?: {
        id: string;
        status: string;
        created: boolean;
        onchainPermissionPda: string | null;
        grantTx: string | null;
    };
}
