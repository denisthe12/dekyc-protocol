"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const hkdf_service_1 = require("../crypto/hkdf.service");
const crypto_1 = require("crypto");
const solana_service_1 = require("../solana/solana.service");
const web3_js_1 = require("@solana/web3.js");
const permission_scopes_1 = require("./permission-scopes");
const permission_scope_hash_1 = require("./permission-scope-hash");
const permission_scope_grants_service_1 = require("../permission-scope-grants/permission-scope-grants.service");
let PermissionsService = class PermissionsService {
    prisma;
    hkdfService;
    solanaService;
    permissionScopeGrantsService;
    constructor(prisma, hkdfService, solanaService, permissionScopeGrantsService) {
        this.prisma = prisma;
        this.hkdfService = hkdfService;
        this.solanaService = solanaService;
        this.permissionScopeGrantsService = permissionScopeGrantsService;
    }
    async grantPermission(userId, dto) {
        const service = await this.prisma.service.findUnique({
            where: { id: dto.serviceId },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        const latestKycProfile = await this.prisma.kycProfile.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        if (!latestKycProfile) {
            throw new common_1.BadRequestException('KYC profile not found');
        }
        const allowedClaims = dto.allowedClaims ?? ['fullName', 'iin', 'email'];
        const allowedScopes = allowedClaims
            .map((claim) => permission_scopes_1.CLAIM_TO_SCOPE[claim])
            .filter(Boolean);
        const scopesHash = (0, permission_scope_hash_1.computeScopesHash)(allowedScopes);
        const latestVault = await this.prisma.kycVaultEntry.findFirst({
            where: {
                userId,
                kycProfileId: latestKycProfile.id,
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!latestVault) {
            throw new common_1.BadRequestException('KYC vault entry not found');
        }
        const onChainUser = await this.ensureUserRegisteredOnChain(userId);
        const existing = await this.prisma.permission.findUnique({
            where: {
                userId_serviceId: {
                    userId,
                    serviceId: dto.serviceId,
                },
            },
        });
        if (existing && existing.status === 'ACTIVE') {
            throw new common_1.BadRequestException('Active permission already exists for this service');
        }
        let permission = existing;
        if (permission) {
            permission = await this.prisma.permission.update({
                where: { id: permission.id },
                data: {
                    status: 'ACTIVE',
                    version: permission.version + 1,
                    revokedAt: null,
                    requiredTokenAmount: dto.requiredTokenAmount ?? null,
                    kycHashSnapshot: latestVault.kycHash,
                    allowedClaims,
                    scopesHash,
                },
            });
        }
        else {
            permission = await this.prisma.permission.create({
                data: {
                    userId,
                    serviceId: dto.serviceId,
                    status: 'ACTIVE',
                    version: 1,
                    requiredTokenAmount: dto.requiredTokenAmount ?? null,
                    kycHashSnapshot: latestVault.kycHash,
                    allowedClaims,
                    scopesHash,
                },
            });
        }
        const permissionKey = this.hkdfService.derivePermissionKey({
            permissionId: permission.id,
            serviceId: permission.serviceId,
            userId,
            version: permission.version,
        });
        const permissionKeyHash = (0, crypto_1.createHash)('sha256')
            .update(permissionKey)
            .digest('hex');
        const updatedPermission = await this.prisma.permission.update({
            where: { id: permission.id },
            data: {
                permissionKeyHash,
            },
        });
        const mintKeypair = web3_js_1.Keypair.generate();
        const tokenAccountKeypair = web3_js_1.Keypair.generate();
        const onChainGrant = await this.solanaService.grantPermissionOnChain({
            userId,
            serviceId: permission.serviceId,
            kycHash: latestVault.kycHash,
            scopesHash,
            requiredAmount: dto.requiredTokenAmount ?? 0,
            mint: mintKeypair.publicKey.toBase58(),
            tokenAccount: tokenAccountKeypair.publicKey.toBase58(),
        });
        const syncedPermission = await this.prisma.permission.update({
            where: { id: updatedPermission.id },
            data: {
                onchainPermissionPda: onChainGrant.permissionPda,
                mintAddress: onChainGrant.mint,
                tokenAccountAddress: onChainGrant.tokenAccount,
                tokenProgram: onChainGrant.tokenProgram,
            },
        });
        const scopeGrants = await this.permissionScopeGrantsService.replaceScopeGrants({
            permissionId: syncedPermission.id,
            serviceId: syncedPermission.serviceId,
            scopes: allowedScopes,
            requiredAmount: dto.requiredTokenAmount ?? 1,
            tokenProgram: onChainGrant.tokenProgram,
        });
        await this.prisma.accessLog.create({
            data: {
                permissionId: updatedPermission.id,
                serviceId: updatedPermission.serviceId,
                decision: 'allowed',
                reason: 'permission_granted',
            },
        });
        return {
            permission: syncedPermission,
            scopeGrants,
            derived: {
                permissionKey,
                permissionKeyHash,
            },
            onChain: {
                userPda: onChainUser.userPda,
                grantTx: onChainGrant.tx,
                permissionPda: onChainGrant.permissionPda,
            },
        };
    }
    async revokePermission(userId, dto) {
        const permission = await this.prisma.permission.findUnique({
            where: { id: dto.permissionId },
        });
        if (!permission) {
            throw new common_1.NotFoundException('Permission not found');
        }
        if (permission.userId !== userId) {
            throw new common_1.BadRequestException('Permission does not belong to current user');
        }
        if (permission.status === 'REVOKED') {
            throw new common_1.BadRequestException('Permission already revoked');
        }
        const updated = await this.prisma.permission.update({
            where: { id: permission.id },
            data: {
                status: 'REVOKED',
                revokedAt: new Date(),
            },
        });
        let revokeTx = null;
        try {
            const onChainRevoke = await this.solanaService.revokePermissionOnChain(permission.serviceId);
            revokeTx = onChainRevoke.tx;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown on-chain revoke error';
            throw new common_1.BadRequestException(`On-chain revoke failed: ${message}`);
        }
        await this.prisma.accessLog.create({
            data: {
                permissionId: updated.id,
                serviceId: updated.serviceId,
                decision: 'denied',
                reason: 'permission_revoked',
            },
        });
        return {
            permission: updated,
            onChain: {
                revokeTx,
                permissionPda: updated.onchainPermissionPda,
            },
        };
    }
    async getMyPermissions(userId) {
        return this.prisma.permission.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                service: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        clientId: true,
                        status: true,
                    },
                },
            },
        });
    }
    async ensureUserRegisteredOnChain(userId) {
        try {
            return await this.solanaService.registerUserOnChain(userId);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown on-chain user registration error';
            if (message.includes('already in use') ||
                message.includes('custom program error') ||
                message.includes('Allocate: account') ||
                message.includes('Account already in use')) {
                const authority = this.solanaService.getWalletPubkey();
                const [userPda] = this.solanaService.deriveUserPda(authority);
                return {
                    tx: null,
                    userPda: userPda.toBase58(),
                    alreadyExisted: true,
                };
            }
            throw error;
        }
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        hkdf_service_1.HkdfService,
        solana_service_1.SolanaService,
        permission_scope_grants_service_1.PermissionScopeGrantsService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map