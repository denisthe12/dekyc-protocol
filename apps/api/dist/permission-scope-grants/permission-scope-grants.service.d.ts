import { PrismaService } from '../prisma/prisma.service';
export declare class PermissionScopeGrantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    replaceScopeGrants(input: {
        permissionId: string;
        serviceId: string;
        scopes: string[];
        requiredAmount: number;
        tokenProgram: string;
    }): Promise<{
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
    }[]>;
    attachTokenRefs(input: {
        permissionId: string;
        scope: string;
        mintAddress: string;
        tokenAccountAddress: string;
        tokenProgram: string;
    }): Promise<{
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
    }>;
    getActiveScopeGrants(permissionId: string): Promise<{
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
    }[]>;
}
