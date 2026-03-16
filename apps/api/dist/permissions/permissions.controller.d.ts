import { PermissionsService } from './permissions.service';
import { Request } from 'express';
import { GrantPermissionDto } from './dto/grant-permission.dto';
import { RevokePermissionDto } from './dto/revoke-permission.dto';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    grant(req: Request & {
        user: {
            sub: string;
            email: string;
        };
    }, body: GrantPermissionDto): Promise<{
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
    revoke(req: Request & {
        user: {
            sub: string;
            email: string;
        };
    }, body: RevokePermissionDto): Promise<{
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
            revokedAt: Date | null;
        };
        onChain: {
            revokeTx: string;
            permissionPda: string | null;
        };
    }>;
    getMy(req: Request & {
        user: {
            sub: string;
            email: string;
        };
    }): Promise<({
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
        revokedAt: Date | null;
    })[]>;
}
