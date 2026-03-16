import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildScopedClaims } from './kyc-claims-policy';

@Injectable()
export class ServiceApiService {
  constructor(private readonly prisma: PrismaService) {}

  async requestKyc(input: {
    serviceId: string;
    userId: string;
    requestedClaims?: string[];
  }) {
    const permission = await this.prisma.permission.findUnique({
      where: {
        userId_serviceId: {
          userId: input.userId,
          serviceId: input.serviceId,
        },
      },
      include: {
        service: true,
      },
    });

    if (!permission) {
      return {
        allowed: false,
        reason: 'permission_not_found',
        claims: null,
      };
    }

    if (permission.status !== 'ACTIVE') {
      await this.prisma.accessLog.create({
        data: {
          permissionId: permission.id,
          serviceId: permission.serviceId,
          decision: 'denied',
          reason: 'permission_not_active',
        },
      });

      return {
        allowed: false,
        reason: 'permission_not_active',
        claims: null,
      };
    }

    const profile = await this.prisma.kycProfile.findFirst({
      where: {
        userId: input.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!profile) {
      await this.prisma.accessLog.create({
        data: {
          permissionId: permission.id,
          serviceId: permission.serviceId,
          decision: 'denied',
          reason: 'kyc_profile_not_found',
        },
      });

      return {
        allowed: false,
        reason: 'kyc_profile_not_found',
        claims: null,
      };
    }

    const fullName = [
        profile.lastName,
        profile.firstName,
        profile.middleName,
    ]
    .filter(Boolean)
    .join(' ');

    const allowedClaims = Array.isArray(permission.allowedClaims)
      ? (permission.allowedClaims as string[])
      : ['fullName', 'iin', 'email'];

    const scoped = buildScopedClaims({
      profile,
      allowedClaims,
      requestedClaims: input.requestedClaims,
    });

    await this.prisma.accessLog.create({
      data: {
        permissionId: permission.id,
        serviceId: permission.serviceId,
        decision: 'allowed',
        reason: 'permission_active',
      },
    });

    return {
      allowed: true,
      reason: 'permission_active',
      claims: scoped.claims,
      grantedClaims: scoped.grantedClaims,
      policy: {
        allowedClaims,
        requestedClaims: input.requestedClaims ?? allowedClaims,
      },
    };
  }
}