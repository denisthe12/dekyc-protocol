import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProtocolMonitorService {
  constructor(private readonly prisma: PrismaService) {}

  async getSnapshot() {
    const permissions = await this.prisma.permission.findMany({
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
        scopeGrants: {
          where: {
            revokedAt: null,
          },
          orderBy: {
            scope: 'asc',
          },
        },
      },
    });

    const accessLogs = await this.prisma.accessLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            clientId: true,
          },
        },
        permission: {
          select: {
            id: true,
            status: true,
            onchainPermissionPda: true,
          },
        },
      },
    });

    return {
      permissions,
      accessLogs,
    };
  }
}