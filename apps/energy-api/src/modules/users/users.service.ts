import { Injectable } from '@nestjs/common';
import {
  EnergyUser,
  EnergyUserRole,
  EnergyWalletStatus,
} from '../../../prisma/generated/client';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { CurrentUser } from './current-user.type';
import { AuthMeResponseDto } from '@/modules/auth/dto/auth-me.response.dto';
import { WalletsService } from '@/modules/wallets/wallets.service';
import { toPrismaJson } from './users-json.helper';

@Injectable()
export class UsersService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly walletsService: WalletsService,
  ) {}

  public async findById(id: string): Promise<CurrentUser | null> {
    const user = await this.prisma.energyUser.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return this.mapToCurrentUser(user);
  }

  public async getMeView(id: string): Promise<AuthMeResponseDto | null> {
    const user = await this.prisma.energyUser.findUnique({
      where: { id },
      include: {
        profile: true,
        wallet: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      dekycUserId: user.dekycUserId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      profile: user.profile
        ? {
            iin: user.profile.iin,
            birthDate: user.profile.birthDate,
            verified: user.profile.verified,
            age18Plus: user.profile.age18Plus,
          }
        : null,
      wallet: user.wallet
        ? {
            custodialWalletAddress: user.wallet.custodialWalletAddress,
            kzteTokenAccountAddress: user.wallet.kzteTokenAccountAddress,
            energyPointsAccountAddress: user.wallet.energyPointsAccountAddress,
            walletStatus: user.wallet.walletStatus,
            initialKzteAirdropped: user.wallet.initialKzteAirdropped,
            initialKzteAirdropTx: user.wallet.initialKzteAirdropTx,
          }
        : null,
    };
  }

  public async findOrCreateFromDekycEnvelope(params: {
    dekycUserId: string;
    claims: Record<string, unknown> | null | undefined;
  }): Promise<CurrentUser> {
    const existing = await this.prisma.energyUser.findUnique({
      where: {
        dekycUserId: params.dekycUserId,
      },
      include: {
        profile: true,
        wallet: true,
      },
    });

    const fullName =
      typeof params.claims?.fullName === 'string'
        ? params.claims.fullName
        : null;

    const email =
      typeof params.claims?.email === 'string' ? params.claims.email : null;

    const iin =
      typeof params.claims?.iin === 'string' ? params.claims.iin : null;

    const birthDate =
      typeof params.claims?.birthDate === 'string'
        ? params.claims.birthDate
        : null;

    const verified =
      typeof params.claims?.verified === 'boolean'
        ? params.claims.verified
        : false;

    const age18Plus =
      typeof params.claims?.age18Plus === 'boolean'
        ? params.claims.age18Plus
        : false;

    let userId: string;

    if (existing) {
      await this.prisma.energyUser.update({
        where: { id: existing.id },
        data: {
          email,
          fullName,
          lastLoginAt: new Date(),
        },
      });

      await this.prisma.energyUserProfile.upsert({
        where: {
          energyUserId: existing.id,
        },
        update: {
          email,
          fullName,
          iin,
          birthDate,
          verified,
          age18Plus,
          rawClaimsJson: toPrismaJson(params.claims),
        },
        create: {
          energyUserId: existing.id,
          dekycUserId: params.dekycUserId,
          email,
          fullName,
          iin,
          birthDate,
          verified,
          age18Plus,
          rawClaimsJson: toPrismaJson(params.claims),
        },
      });

      userId = existing.id;
    } else {
      const created = await this.prisma.energyUser.create({
        data: {
          dekycUserId: params.dekycUserId,
          email,
          fullName,
          role: EnergyUserRole.USER,
          lastLoginAt: new Date(),
          profile: {
            create: {
              dekycUserId: params.dekycUserId,
              email,
              fullName,
              iin,
              birthDate,
              verified,
              age18Plus,
              rawClaimsJson: toPrismaJson(params.claims),
            },
          },
          wallet: {
            create: {
              custodialWalletAddress: `pending-${params.dekycUserId}`,
              walletStatus: EnergyWalletStatus.PENDING,
            },
          },
        },
      });

      userId = created.id;
    }

    await this.walletsService.ensureUserWallet({
      energyUserId: userId,
    });

    const user = await this.prisma.energyUser.findUniqueOrThrow({
      where: { id: userId },
    });

    return this.mapToCurrentUser(user);
  }

  private mapToCurrentUser(user: EnergyUser): CurrentUser {
    return {
      id: user.id,
      dekycUserId: user.dekycUserId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }
}