import { PrismaService } from '../prisma/prisma.service';
import { GrantPermissionDto } from './dto/grant-permission.dto';
import { RevokePermissionDto } from './dto/revoke-permission.dto';
import { HkdfService } from '../crypto/hkdf.service';
import { SolanaService } from '../solana/solana.service';
export declare class PermissionsService {
    private readonly prisma;
    private readonly hkdfService;
    private readonly solanaService;
    constructor(prisma: PrismaService, hkdfService: HkdfService, solanaService: SolanaService);
    grantPermission(userId: string, dto: GrantPermissionDto): Promise<{
        permission: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            serviceId: string;
            version: number;
            requiredTokenAmount: number | null;
            onchainPermissionPda: string | null;
            permissionKeyHash: string | null;
            kycHashSnapshot: string | null;
            allowedClaims: import("@prisma/client/runtime/library").JsonValue | null;
            mintAddress: string | null;
            tokenAccountAddress: string | null;
            tokenProgram: string | null;
            revokedAt: Date | null;
        };
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
            version: number;
            requiredTokenAmount: number | null;
            onchainPermissionPda: string | null;
            permissionKeyHash: string | null;
            kycHashSnapshot: string | null;
            allowedClaims: import("@prisma/client/runtime/library").JsonValue | null;
            mintAddress: string | null;
            tokenAccountAddress: string | null;
            tokenProgram: string | null;
            revokedAt: Date | null;
        };
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
        version: number;
        requiredTokenAmount: number | null;
        onchainPermissionPda: string | null;
        permissionKeyHash: string | null;
        kycHashSnapshot: string | null;
        allowedClaims: import("@prisma/client/runtime/library").JsonValue | null;
        mintAddress: string | null;
        tokenAccountAddress: string | null;
        tokenProgram: string | null;
        revokedAt: Date | null;
    })[]>;
    private ensureUserRegisteredOnChain;
}
