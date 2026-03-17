import { PrismaService } from '../prisma/prisma.service';
export declare class ServiceApiService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
        policy?: undefined;
    } | {
        allowed: boolean;
        reason: string;
        claims: Record<string, unknown>;
        grantedClaims: string[];
        grantedScopes: ("kyc.full_name" | "kyc.email" | "kyc.iin" | "kyc.birth_date" | "kyc.gender" | "kyc.country" | "kyc.verified" | "kyc.age_18_plus")[];
        policy: {
            allowedClaims: string[];
            requestedClaims: string[];
            allowedScopes: ("kyc.full_name" | "kyc.email" | "kyc.iin" | "kyc.birth_date" | "kyc.gender" | "kyc.country" | "kyc.verified" | "kyc.age_18_plus")[];
            requestedScopes: ("kyc.full_name" | "kyc.email" | "kyc.iin" | "kyc.birth_date" | "kyc.gender" | "kyc.country" | "kyc.verified" | "kyc.age_18_plus")[];
        };
    }>;
}
