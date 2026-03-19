import { PrismaService } from '../prisma/prisma.service';
import { Token2022Service } from '../solana/token-2022.service';
import { ServicesService } from '../services/services.service';
export interface TokenCheck {
    scope: string;
    ok: boolean;
    reason: string;
    readError: string | null;
    tokenAccountAddress: string | null;
    mintAddress: string | null;
    balance: number;
    requiredAmount: number;
}
export declare class ServiceApiService {
    private readonly prisma;
    private readonly token2022Service;
    private readonly servicesService;
    constructor(prisma: PrismaService, token2022Service: Token2022Service, servicesService: ServicesService);
    requestKyc(input: {
        serviceId: string;
        clientId: string;
        nonce: string;
        timestamp: number;
        userId: string;
        requestedClaims?: string[];
    }): Promise<{
        payload: unknown;
        meta: {
            timestamp: number;
            nonce: string;
        };
        signature: null;
    } | {
        payload: unknown;
        meta: {
            timestamp: number;
            nonce: string;
        };
        signature: string;
    }>;
    private buildSignedEnvelope;
}
