import { PrismaService } from '../prisma/prisma.service';
import { GrantPermissionDto } from './dto/grant-permission.dto';
import { RevokePermissionDto } from './dto/revoke-permission.dto';
import { HkdfService } from '../crypto/hkdf.service';
import { SolanaService } from '../solana/solana.service';
import { PermissionScopeGrantsService } from '../permission-scope-grants/permission-scope-grants.service';
import { Token2022Service } from '../solana/token-2022.service';
interface MaterializedScopeGrant {
    scope: string;
    requiredAmount: number;
    mintAddress: string;
    tokenAccountAddress: string;
    tokenProgram: string;
    initTx: string | null;
    mintTx: string;
}
interface BurnResult {
    scope: string;
    burnTx: string;
    mintAddress: string;
    tokenAccountAddress: string;
}
export declare class PermissionsService {
    private readonly prisma;
    private readonly hkdfService;
    private readonly solanaService;
    private readonly permissionScopeGrantsService;
    private readonly token2022Service;
    constructor(prisma: PrismaService, hkdfService: HkdfService, solanaService: SolanaService, permissionScopeGrantsService: PermissionScopeGrantsService, token2022Service: Token2022Service);
    grantPermission(userId: string, dto: GrantPermissionDto): Promise<{
        permission: {
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
            allowedClaims: import("@prisma/client/runtime/library").JsonValue | null;
            scopesHash: string | null;
        };
        scopeGrants: MaterializedScopeGrant[];
        derived: {
            permissionKey: string;
            permissionKeyHash: string;
        };
        onChain: {
            userPda: string;
            grantTx: string;
            permissionPda: string;
        };
    }>;
    revokePermission(userId: string, dto: RevokePermissionDto): Promise<{
        permission: {
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
            allowedClaims: import("@prisma/client/runtime/library").JsonValue | null;
            scopesHash: string | null;
        };
        burnedScopeGrants: BurnResult[];
        onChain: {
            revokeTx: string;
            permissionPda: string | null;
        };
    }>;
    getMyPermissions(userId: string): Promise<({
        service: {
            id: string;
            name: string;
            status: string;
            clientId: string;
            description: string | null;
        };
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
        allowedClaims: import("@prisma/client/runtime/library").JsonValue | null;
        scopesHash: string | null;
    })[]>;
    private ensureUserRegisteredOnChain;
    private generateRequiredAmount;
}
export {};
