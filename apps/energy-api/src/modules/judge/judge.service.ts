import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { SolanaService } from '@/modules/solana/solana.service';
import { Token2022Service } from '@/modules/solana/token-2022.service';

@Injectable()
export class JudgeService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly solanaService: SolanaService,
    private readonly token2022Service: Token2022Service,
  ) {}

  public async getJudgeSummary() {
    const [solanaStatus, kzteStatus] = await Promise.all([
      this.solanaService.getSignerStatus(),
      this.token2022Service.getKzteMintStatus(),
    ]);

    const [users, assets, positions, epochs, claims] = await Promise.all([
      this.prisma.energyUser.findMany({
        include: {
          profile: true,
          wallet: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
      this.prisma.energyAsset.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      }),
      this.prisma.energyInvestorPosition.findMany({
        orderBy: {
          updatedAt: 'desc',
        },
        take: 20,
      }),
      this.prisma.energyRevenueEpoch.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      }),
      this.prisma.energyPayoutClaim.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      }),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      solana: {
        rpcUrl: solanaStatus.rpcUrl,
        signerAddress: solanaStatus.signerAddress,
        signerBalanceSol: solanaStatus.signerBalanceSol,
        tokenizationProgramId: this.solanaService.getProgramId().toBase58(),
      },
      kzte: kzteStatus,
      users,
      assets,
      positions,
      epochs,
      claims,
    };
  }
}