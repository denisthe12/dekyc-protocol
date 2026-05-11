import { PrismaService } from '../prisma/prisma.service';
export declare class ProtocolMonitorService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSnapshot(): Promise<{
        permissions: ({
            service: {
                id: string;
                name: string;
                status: string;
                clientId: string;
                description: string | null;
            };
            scopeGrants: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                permissionId: string;
                serviceId: string;
                scope: string;
                requiredAmount: number;
                mintAddress: string | null;
                tokenAccountAddress: string | null;
                tokenProgram: string | null;
                balanceCheckMode: string;
                revokedAt: Date | null;
            }[];
        } & {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            serviceId: string;
            mintAddress: string | null;
            tokenAccountAddress: string | null;
            tokenProgram: string | null;
            revokedAt: Date | null;
            version: number;
            requiredTokenAmount: number | null;
            onchainPermissionPda: string | null;
            permissionKeyHash: string | null;
            kycHashSnapshot: string | null;
            allowedClaims: import("../../prisma/generated/client/runtime/library").JsonValue | null;
            scopesHash: string | null;
        })[];
        accessLogs: ({
            service: {
                id: string;
                name: string;
                clientId: string;
            };
            permission: {
                id: string;
                status: string;
                onchainPermissionPda: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            permissionId: string;
            serviceId: string;
            decision: string;
            reason: string | null;
        })[];
    }>;
}
