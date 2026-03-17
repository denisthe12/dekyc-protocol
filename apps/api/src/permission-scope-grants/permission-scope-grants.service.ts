import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionScopeGrant } from '@prisma/client';

@Injectable()
export class PermissionScopeGrantsService {
  constructor(private readonly prisma: PrismaService) {}

  async replaceScopeGrants(input: {
    permissionId: string;
    serviceId: string;
    scopes: string[];
    requiredAmount: number;
    tokenProgram: string;
  }) {
    const uniqueScopes = [...new Set(input.scopes)].sort();

    const existing = await this.prisma.permissionScopeGrant.findMany({
      where: {
        permissionId: input.permissionId,
      },
    });

    for (const row of existing) {
      if (!uniqueScopes.includes(row.scope)) {
        await this.prisma.permissionScopeGrant.update({
          where: { id: row.id },
          data: {
            revokedAt: new Date(),
          },
        });
      }
    }

    const results: PermissionScopeGrant[] = [];

    for (const scope of uniqueScopes) {
      const found = existing.find((row) => row.scope === scope);

      if (found) {
        const updated = await this.prisma.permissionScopeGrant.update({
          where: { id: found.id },
          data: {
            requiredAmount: input.requiredAmount,
            tokenProgram: input.tokenProgram,
            revokedAt: null,
          },
        });

        results.push(updated);
      } else {
        const created = await this.prisma.permissionScopeGrant.create({
          data: {
            permissionId: input.permissionId,
            serviceId: input.serviceId,
            scope,
            requiredAmount: input.requiredAmount,
            tokenProgram: input.tokenProgram,
            balanceCheckMode: 'gte',
          },
        });

        results.push(created);
      }
    }

    return results;
  }

  async attachTokenRefs(input: {
    permissionId: string;
    scope: string;
    mintAddress: string;
    tokenAccountAddress: string;
    tokenProgram: string;
  }) {
    return this.prisma.permissionScopeGrant.update({
      where: {
        permissionId_scope: {
          permissionId: input.permissionId,
          scope: input.scope,
        },
      },
      data: {
        mintAddress: input.mintAddress,
        tokenAccountAddress: input.tokenAccountAddress,
        tokenProgram: input.tokenProgram,
      },
    });
  }

  async getActiveScopeGrants(permissionId: string) {
    return this.prisma.permissionScopeGrant.findMany({
      where: {
        permissionId,
        revokedAt: null,
      },
      orderBy: {
        scope: 'asc',
      },
    });
  }
}