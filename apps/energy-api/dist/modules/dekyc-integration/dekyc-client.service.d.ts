type DekycSignedEnvelope = {
    payload: {
        allowed: boolean;
        reason: string;
        claims: Record<string, unknown> | null;
        grantedClaims?: string[];
        grantedScopes?: string[];
        tokenChecks?: Array<{
            scope: string;
            ok: boolean;
            reason: string;
            readError: string | null;
            tokenAccountAddress: string | null;
            mintAddress: string | null;
            balance: number;
            requiredAmount: number;
        }>;
        scopeGrantRefs?: Array<{
            scope: string;
            mintAddress: string | null;
            tokenAccountAddress: string | null;
            requiredAmount: number;
            balanceCheckMode?: string;
        }>;
        policy?: {
            allowedClaims?: string[];
            requestedClaims?: string[];
            allowedScopes?: string[];
            requestedScopes?: string[];
        };
    };
    meta: {
        timestamp: number;
        nonce: string;
    };
    signature: string | null;
    resolvedUserId: string;
};
export declare class DekycClientService {
    private readonly baseUrl;
    private readonly serviceId;
    private readonly clientId;
    private readonly clientSecret;
    login(params: {
        biometricMockId: string;
        loginCode: string;
        requestedClaims?: string[];
    }): Promise<DekycSignedEnvelope>;
}
export {};
