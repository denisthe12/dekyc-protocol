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
        policy?: undefined;
    } | {
        allowed: boolean;
        reason: string;
        claims: Record<string, unknown>;
        grantedClaims: string[];
        policy: {
            allowedClaims: string[];
            requestedClaims: string[];
        };
    }>;
}
