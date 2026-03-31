import { Injectable } from '@nestjs/common';
import { EnergyUserRole } from '../../../prisma/generated/client';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { WalletsService } from '@/modules/wallets/wallets.service';

@Injectable()
export class DevService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly walletsService: WalletsService,
  ) {}

  public async seedDemoInvestor() {
    const existing = await this.prisma.energyUser.findUnique({
      where: {
        dekycUserId: 'demo-investor-2',
      },
      include: {
        profile: true,
        wallet: true,
      },
    });

    if (existing) {
      await this.walletsService.ensureUserWallet({
        energyUserId: existing.id,
      });

      const hydrated = await this.prisma.energyUser.findUniqueOrThrow({
        where: {
          id: existing.id,
        },
        include: {
          profile: true,
          wallet: true,
        },
      });

      return {
        created: false,
        user: hydrated,
      };
    }

    const created = await this.prisma.energyUser.create({
      data: {
        dekycUserId: 'demo-investor-2',
        email: 'demo-investor-2@energy.local',
        fullName: 'Demo Investor Two',
        role: EnergyUserRole.USER,
        lastLoginAt: new Date(),
        profile: {
          create: {
            dekycUserId: 'demo-investor-2',
            email: 'demo-investor-2@energy.local',
            fullName: 'Demo Investor Two',
            iin: '000000000002',
            birthDate: '1995-01-01',
            verified: true,
            age18Plus: true,
            rawClaimsJson: {
              source: 'demo-seed',
              verified: true,
              age18Plus: true,
            },
          },
        },
        wallet: {
          create: {
            custodialWalletAddress: 'pending-demo-investor-2',
            walletStatus: 'PENDING',
          },
        },
      },
      include: {
        profile: true,
        wallet: true,
      },
    });

    await this.walletsService.ensureUserWallet({
      energyUserId: created.id,
    });

    const hydrated = await this.prisma.energyUser.findUniqueOrThrow({
      where: {
        id: created.id,
      },
      include: {
        profile: true,
        wallet: true,
      },
    });

    return {
      created: true,
      user: hydrated,
    };
  }
}