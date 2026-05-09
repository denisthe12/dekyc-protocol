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
import { PublicKey } from '@solana/web3.js';
import { getAccount, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { SolanaService } from '../solana/solana.service';
import { EnergyPointsService } from '../solana/energy-points.service';

@Injectable()
export class UsersService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly walletsService: WalletsService,
    private readonly solanaService: SolanaService,
    private readonly energyPointsService: EnergyPointsService
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
        dekycConnectLogins: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return null;
    }

    const latestDekycConnectLogin = user.dekycConnectLogins[0] ?? null;

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
      latestDekycConnectLogin: latestDekycConnectLogin
        ? {
            id: latestDekycConnectLogin.id,
            assertionId: latestDekycConnectLogin.assertionId,
            consentId: latestDekycConnectLogin.consentId,
            serviceSubjectId: latestDekycConnectLogin.serviceSubjectId,
            consentReceiptHash: latestDekycConnectLogin.consentReceiptHash,
            assertionExpiresAt:
              latestDekycConnectLogin.assertionExpiresAt.toISOString(),
            createdAt: latestDekycConnectLogin.createdAt.toISOString(),
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

  public async getProfile(energyUserId: string) {
    const user = await this.prisma.energyUser.findUniqueOrThrow({
      where: {
        id: energyUserId,
      },
      include: {
        profile: true,
      },
    });

    const wallet = await this.prisma.energyUserWallet.findUnique({
      where: {
        energyUserId,
      },
    });

    const actionPassword = await this.prisma.energyUserActionPassword.findUnique({
      where: {
        energyUserId,
      },
      select: {
        id: true,
      },
    });

    const connection = this.solanaService.getConnection();

    let kzteAmountBaseUnits = '0';
    let energyPointsAmountBaseUnits = '0';

    if (wallet?.kzteTokenAccountAddress) {
      try {
        const account = await getAccount(
          connection,
          new PublicKey(wallet.kzteTokenAccountAddress),
          undefined,
          TOKEN_2022_PROGRAM_ID,
        );
        kzteAmountBaseUnits = account.amount.toString();
      } catch {
        kzteAmountBaseUnits = '0';
      }
    }

    if (wallet?.energyPointsTokenAccountAddress) {
      try {
        const account = await getAccount(
          connection,
          new PublicKey(wallet.energyPointsTokenAccountAddress),
          undefined,
          TOKEN_2022_PROGRAM_ID,
        );
        energyPointsAmountBaseUnits = account.amount.toString();
      } catch {
        energyPointsAmountBaseUnits = '0';
      }
    }

    const energyPointsStatus =
      await this.energyPointsService.getEnergyPointsMintStatus();

    return {
      user: {
        id: user.id,
        dekycUserId: user.dekycUserId,
        fullName: user.fullName,
        email: user.email,
        iin: user.profile?.iin,
        createdAt: user.createdAt.toISOString(),
      },
      wallet: wallet
        ? {
            custodialWalletAddress: wallet.custodialWalletAddress,
            kzteTokenAccountAddress: wallet.kzteTokenAccountAddress,
            energyPointsTokenAccountAddress:
              wallet.energyPointsTokenAccountAddress,
          }
        : null,
      balances: {
        kzte: {
          amountBaseUnits: kzteAmountBaseUnits,
          decimals: 2,
        },
        energyPoints: {
          amountBaseUnits: energyPointsAmountBaseUnits,
          decimals: energyPointsStatus.decimals ?? 2,
        },
      },
      security: {
        actionPasswordIsSet: Boolean(actionPassword),
      },
    };
  }
}