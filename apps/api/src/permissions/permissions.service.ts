import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GrantPermissionDto } from './dto/grant-permission.dto';
import { RevokePermissionDto } from './dto/revoke-permission.dto';
import { HkdfService } from '../crypto/hkdf.service';
import { createHash } from 'crypto';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hkdfService: HkdfService,
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
            allowedClaims: dto.allowedClaims ?? ['fullName', 'iin', 'email'],
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
            allowedClaims: dto.allowedClaims ?? ['fullName', 'iin', 'email'],
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

    await this.prisma.accessLog.create({
      data: {
        permissionId: updatedPermission.id,
        serviceId: updatedPermission.serviceId,
        decision: 'allowed',
        reason: 'permission_granted',
      },
    });

    return {
      permission: updatedPermission,
      derived: {
        permissionKey,
        permissionKeyHash,
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
}