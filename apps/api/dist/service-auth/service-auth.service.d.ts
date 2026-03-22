import { PrismaService } from '../prisma/prisma.service';
import { ServiceApiService } from '../service-api/service-api.service';
export declare class ServiceAuthService {
    private readonly prisma;
    private readonly serviceApiService;
    constructor(prisma: PrismaService, serviceApiService: ServiceApiService);
    login(input: {
        serviceId: string;
        clientId: string;
        nonce: string;
        timestamp: number;
        userId: string;
        biometricMockId: string;
        loginCode: string;
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
}
