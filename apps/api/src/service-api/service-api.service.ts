import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildScopedClaims } from './kyc-claims-policy';
import { Token2022Service } from '../solana/token-2022.service';
import { CLAIM_TO_SCOPE } from '../permissions/permission-scopes';

export interface TokenCheck {
  scope: string;
  ok: boolean;
  reason: string;
  tokenAccountAddress: string | null;
  mintAddress: string | null;
  balance: number;
  requiredAmount: number;
}

@Injectable()
export class ServiceApiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly token2022Service: Token2022Service,
  ) {}

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

    const activeScopeGrants = await this.prisma.permissionScopeGrant.findMany({
      where: {
        permissionId: permission.id,
        revokedAt: null,
      },
      orderBy: {
        scope: 'asc',
      },
    });

    const requestedClaims =
      input.requestedClaims && input.requestedClaims.length > 0
        ? input.requestedClaims.map((c) => c.trim())
        : Array.isArray(permission.allowedClaims)
          ? (permission.allowedClaims as string[])
          : ['fullName', 'iin', 'email'];

    const requestedScopes = requestedClaims
      .map((claim) => CLAIM_TO_SCOPE[claim])
      .filter(Boolean);

    const tokenChecks: TokenCheck[] = [];

    for (const scope of requestedScopes) {
      const grant = activeScopeGrants.find((row) => row.scope === scope);

      if (!grant) {
        tokenChecks.push({
          scope,
          ok: false,
          reason: 'scope_grant_not_found',
          tokenAccountAddress: null,
          mintAddress: null,
          balance: 0,
          requiredAmount: 0,
        });
        continue;
      }

      if (!grant.tokenAccountAddress || !grant.mintAddress) {
        tokenChecks.push({
          scope,
          ok: false,
          reason: 'token_refs_missing',
          tokenAccountAddress: grant.tokenAccountAddress,
          mintAddress: grant.mintAddress,
          balance: 0,
          requiredAmount: grant.requiredAmount,
        });
        continue;
      }

      let balance = 0;
      let ok = false;
      let reason = 'balance_insufficient';

      try {
        balance = await this.token2022Service.getScopeTokenBalance(
          grant.tokenAccountAddress,
        );

        ok = balance >= grant.requiredAmount;
        reason = ok ? 'balance_ok' : 'balance_insufficient';
      } catch {
        ok = false;
        reason = 'token_account_read_failed';
      }

      tokenChecks.push({
        scope,
        ok,
        reason,
        tokenAccountAddress: grant.tokenAccountAddress,
        mintAddress: grant.mintAddress,
        balance,
        requiredAmount: grant.requiredAmount,
      });
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

    const tokenApprovedScopes = tokenChecks
      .filter((row) => row.ok)
      .map((row) => row.scope);

    const tokenApprovedClaims = allowedClaims.filter((claim) => {
      const scope = CLAIM_TO_SCOPE[claim];
      return tokenApprovedScopes.includes(scope);
    });

    const scoped = buildScopedClaims({
      profile,
      allowedClaims: tokenApprovedClaims,
      requestedClaims,
    });

    if (scoped.grantedClaims.length === 0) {
      await this.prisma.accessLog.create({
        data: {
          permissionId: permission.id,
          serviceId: permission.serviceId,
          decision: 'denied',
          reason: 'token_balance_check_failed',
        },
      });

      return {
        allowed: false,
        reason: 'token_balance_check_failed',
        claims: null,
        grantedClaims: [],
        grantedScopes: [],
        tokenChecks,
      };
    }

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
      grantedScopes: scoped.grantedScopes,
      tokenChecks,
      scopeGrantRefs: activeScopeGrants.map((row) => ({
        scope: row.scope,
        mintAddress: row.mintAddress,
        tokenAccountAddress: row.tokenAccountAddress,
        requiredAmount: row.requiredAmount,
        balanceCheckMode: row.balanceCheckMode,
      })),
      policy: {
        allowedClaims,
        requestedClaims,
        allowedScopes: scoped.allowedScopes,
        requestedScopes: scoped.requestedScopes,
      },
    };
  }
}