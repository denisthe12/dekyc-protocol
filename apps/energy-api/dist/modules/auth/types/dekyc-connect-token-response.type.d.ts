export interface DekycConnectTokenResponse {
    tokenType: 'dekyc_identity_assertion';
    expiresIn: number;
    identityAssertion: {
        assertionJws: string;
        payload: {
            iss: string;
            aud: string;
            assertionId: string;
            subjectId: string;
            serviceSubjectId: string;
            serviceId: string;
            verificationStatus: string;
            verificationTime: string;
            kycProvider: string;
            assuranceLevel: string;
            consentId: string;
            claimsScope: string[];
            revocationStatus: string;
            iat: number;
            exp: number;
        };
        algorithm: string;
    };
    consentReceipt: {
        consentId: string;
        serviceId: string;
        subjectId: string;
        serviceSubjectId: string;
        grantedClaims: string[];
        consentTextVersion: string;
        grantedAt: string;
        expiresAt: string | null;
        revokedAt: string | null;
        receiptHash: string;
        signature: string;
        status: string;
    };
    minimalClaims: Partial<Record<string, string | boolean>>;
}
