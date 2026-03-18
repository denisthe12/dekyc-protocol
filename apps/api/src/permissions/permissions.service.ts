import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GrantPermissionDto } from './dto/grant-permission.dto';
import { RevokePermissionDto } from './dto/revoke-permission.dto';
import { HkdfService } from '../crypto/hkdf.service';
import { createHash } from 'crypto';
import { SolanaService } from '../solana/solana.service';
import { Keypair } from '@solana/web3.js';
import { CLAIM_TO_SCOPE } from './permission-scopes';
import { computeScopesHash } from './permission-scope-hash';
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

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hkdfService: HkdfService,
    private readonly solanaService: SolanaService,
    private readonly permissionScopeGrantsService: PermissionScopeGrantsService,
    private readonly token2022Service: Token2022Service,
  ) {}

  async grantPermission(userId: string, dto: GrantPermissionDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const latestKycProfile = await this.prisma.kycProfile.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestKycProfile) {
      throw new BadRequestException('KYC profile not found');
    }

    const allowedClaims = dto.allowedClaims ?? ['fullName', 'iin', 'email'];

    const allowedScopes = allowedClaims
      .map((claim) => CLAIM_TO_SCOPE[claim])
      .filter(Boolean);

    const scopesHash = computeScopesHash(allowedScopes);

    const latestVault = await this.prisma.kycVaultEntry.findFirst({
      where: {
        userId,
        kycProfileId: latestKycProfile.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestVault) {
      throw new BadRequestException('KYC vault entry not found');
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
      throw new BadRequestException('Active permission already exists for this service');
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
    } else {
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

    const permissionKeyHash = createHash('sha256')
      .update(permissionKey)
      .digest('hex');

    const updatedPermission = await this.prisma.permission.update({
      where: { id: permission.id },
      data: {
        permissionKeyHash,
      },
    });

    const mintKeypair = Keypair.generate();
    const tokenAccountKeypair = Keypair.generate();

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

    const materializedScopeGrants: MaterializedScopeGrant[] = [];

    for (const scopeGrant of scopeGrants) {
      const serviceOwner = this.solanaService.getWalletPubkey();

      const scopeTokenSetup = await this.token2022Service.createScopeMintAndAccount({
        serviceId: syncedPermission.serviceId,
        scope: scopeGrant.scope,
        serviceOwner,
        decimals: 0,
      });

      await this.permissionScopeGrantsService.attachTokenRefs({
        permissionId: syncedPermission.id,
        scope: scopeGrant.scope,
        mintAddress: scopeTokenSetup.mint,
        tokenAccountAddress: scopeTokenSetup.tokenAccount,
        tokenProgram: scopeTokenSetup.tokenProgram,
      });

      const mintResult = await this.token2022Service.mintScopeTokens({
        mint: scopeTokenSetup.mint,
        tokenAccount: scopeTokenSetup.tokenAccount,
        amount: scopeGrant.requiredAmount,
      });

      materializedScopeGrants.push({
        scope: scopeGrant.scope,
        requiredAmount: scopeGrant.requiredAmount,
        mintAddress: scopeTokenSetup.mint,
        tokenAccountAddress: scopeTokenSetup.tokenAccount,
        tokenProgram: scopeTokenSetup.tokenProgram,
        initTx: scopeTokenSetup.initTx,
        mintTx: mintResult.tx,
      });
    }

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
      scopeGrants: materializedScopeGrants,
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

  async revokePermission(userId: string, dto: RevokePermissionDto) {
    const permission = await this.prisma.permission.findUnique({
      where: { id: dto.permissionId },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (permission.userId !== userId) {
      throw new BadRequestException('Permission does not belong to current user');
    }

    if (permission.status === 'REVOKED') {
      throw new BadRequestException('Permission already revoked');
    }

    const updated = await this.prisma.permission.update({
      where: { id: permission.id },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    let revokeTx: string | null = null;

    try {
      const onChainRevoke = await this.solanaService.revokePermissionOnChain(
        permission.serviceId,
      );
      revokeTx = onChainRevoke.tx;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown on-chain revoke error';

      throw new BadRequestException(`On-chain revoke failed: ${message}`);
    }

    await this.prisma.accessLog.create({
      data: {
        permissionId: updated.id,
        serviceId: updated.serviceId,
        decision: 'denied',
        reason: 'permission_revoked',
      },
    });

    const activeScopeGrants = await this.permissionScopeGrantsService.getActiveScopeGrants(
      permission.id,
    );

    const burnResults: BurnResult[] = [];

    for (const scopeGrant of activeScopeGrants) {
      if (scopeGrant.mintAddress && scopeGrant.tokenAccountAddress) {
        const burn = await this.token2022Service.burnScopeTokens({
          mint: scopeGrant.mintAddress,
          tokenAccount: scopeGrant.tokenAccountAddress,
          amount: scopeGrant.requiredAmount,
        });

        await this.prisma.permissionScopeGrant.update({
          where: { id: scopeGrant.id },
          data: {
            revokedAt: new Date(),
          },
        });

        burnResults.push({
          scope: scopeGrant.scope,
          burnTx: burn.tx,
          mintAddress: scopeGrant.mintAddress,
          tokenAccountAddress: scopeGrant.tokenAccountAddress,
        });
      }
    }

    return {
      permission: updated,
      burnedScopeGrants: burnResults,
      onChain: {
        revokeTx,
        permissionPda: updated.onchainPermissionPda,
      },
    };
  }

  async getMyPermissions(userId: string) {
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

  private async ensureUserRegisteredOnChain(userId: string) {
    try {
      return await this.solanaService.registerUserOnChain(userId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown on-chain user registration error';

      if (
        message.includes('already in use') ||
        message.includes('custom program error') ||
        message.includes('Allocate: account') ||
        message.includes('Account already in use')
      ) {
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
}