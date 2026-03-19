import { PrismaService } from '../prisma/prisma.service';
import { Token2022Service } from '../solana/token-2022.service';
export interface TokenCheck {
    scope: string;
    ok: boolean;
    reason: string;
    tokenAccountAddress: string | null;
    mintAddress: string | null;
    balance: number;
    requiredAmount: number;
}
export declare class ServiceApiService {
    private readonly prisma;
    private readonly token2022Service;
    constructor(prisma: PrismaService, token2022Service: Token2022Service);
    requestKyc(input: {
        serviceId: string;
        userId: string;
        requestedClaims?: string[];
    }): Promise<{
        allowed: boolean;
        reason: string;
        claims: null;
        grantedClaims?: undefined;
        grantedScopes?: undefined;
        tokenChecks?: undefined;
        scopeGrantRefs?: undefined;
        policy?: undefined;
    } | {
        allowed: boolean;
        reason: string;
        claims: null;
        grantedClaims: never[];
        grantedScopes: never[];
        tokenChecks: TokenCheck[];
        scopeGrantRefs?: undefined;
        policy?: undefined;
    } | {
        allowed: boolean;
        reason: string;
        claims: Record<string, unknown>;
        grantedClaims: string[];
        grantedScopes: ("kyc.full_name" | "kyc.email" | "kyc.iin" | "kyc.birth_date" | "kyc.gender" | "kyc.country" | "kyc.verified" | "kyc.age_18_plus")[];
        tokenChecks: TokenCheck[];
        scopeGrantRefs: {
            scope: string;
            mintAddress: string | null;
            tokenAccountAddress: string | null;
            requiredAmount: number;
            balanceCheckMode: string;
        }[];
        policy: {
            allowedClaims: string[];
            requestedClaims: string[];
            allowedScopes: ("kyc.full_name" | "kyc.email" | "kyc.iin" | "kyc.birth_date" | "kyc.gender" | "kyc.country" | "kyc.verified" | "kyc.age_18_plus")[];
            requestedScopes: ("kyc.full_name" | "kyc.email" | "kyc.iin" | "kyc.birth_date" | "kyc.gender" | "kyc.country" | "kyc.verified" | "kyc.age_18_plus")[];
        };
    }>;
}
