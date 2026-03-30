import { Injectable } from '@nestjs/common';
import { getAccount, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { SolanaService } from '@/modules/solana/solana.service';

@Injectable()
export class PositionsService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly solanaService: SolanaService,
  ) {}

  public async recordPurchase(params: {
    energyUserId: string;
    energyAssetId: string;
    assetId: string;
    assetPda: string;
    shareMintAddress: string;
    buyerWalletAddress: string;
    buyerKzteAccount: string | null;
    buyerShareAccount: string;
    purchasedShares: number;
    totalKzteSpent: number;
    tx: string;
  }) {
    const existing = await this.prisma.energyInvestorPosition.findUnique({
      where: {
        energyUserId_energyAssetId: {
          energyUserId: params.energyUserId,
          energyAssetId: params.energyAssetId,
        },
      },
    });

    if (!existing) {
      return this.prisma.energyInvestorPosition.create({
        data: {
          energyUserId: params.energyUserId,
          energyAssetId: params.energyAssetId,
          assetId: params.assetId,
          assetPda: params.assetPda,
          shareMintAddress: params.shareMintAddress,
          buyerWalletAddress: params.buyerWalletAddress,
          buyerKzteAccount: params.buyerKzteAccount,
          buyerShareAccount: params.buyerShareAccount,
          totalSharesPurchased: params.purchasedShares,
          totalKzteSpent: params.totalKzteSpent,
          averagePricePerShare: Math.floor(
            params.totalKzteSpent / params.purchasedShares,
          ),
          lastPurchaseTx: params.tx,
          status: 'ACTIVE',
        },
      });
    }

    const nextTotalShares =
      existing.totalSharesPurchased + params.purchasedShares;
    const nextTotalSpent = existing.totalKzteSpent + params.totalKzteSpent;
    const nextAveragePrice = Math.floor(nextTotalSpent / nextTotalShares);

    return this.prisma.energyInvestorPosition.update({
      where: {
        energyUserId_energyAssetId: {
          energyUserId: params.energyUserId,
          energyAssetId: params.energyAssetId,
        },
      },
      data: {
        buyerWalletAddress: params.buyerWalletAddress,
        buyerKzteAccount: params.buyerKzteAccount,
        buyerShareAccount: params.buyerShareAccount,
        totalSharesPurchased: nextTotalShares,
        totalKzteSpent: nextTotalSpent,
        averagePricePerShare: nextAveragePrice,
        lastPurchaseTx: params.tx,
        status: 'ACTIVE',
      },
    });
  }

  public async reconcilePosition(params: {
    energyUserId: string;
    assetId: string;
  }) {
    const asset = await this.prisma.energyAsset.findUniqueOrThrow({
      where: {
        assetId: params.assetId,
      },
    });

    const wallet = await this.prisma.energyUserWallet.findUniqueOrThrow({
      where: {
        energyUserId: params.energyUserId,
      },
    });

    const position = await this.prisma.energyInvestorPosition.findUnique({
      where: {
        energyUserId_energyAssetId: {
          energyUserId: params.energyUserId,
          energyAssetId: asset.id,
        },
      },
    });

    if (!position?.buyerShareAccount) {
      throw new Error('Investor position or buyer share account not found');
    }

    const connection = this.solanaService.getConnection();
    const tokenAccount = await getAccount(
      connection,
      new PublicKey(position.buyerShareAccount),
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    const onchainShares = Number(tokenAccount.amount);
    const recalculatedTotalSpent = onchainShares * asset.pricePerShareKzte;
    const averagePricePerShare =
      onchainShares > 0
        ? Math.floor(recalculatedTotalSpent / onchainShares)
        : 0;

    const updated = await this.prisma.energyInvestorPosition.update({
      where: {
        energyUserId_energyAssetId: {
          energyUserId: params.energyUserId,
          energyAssetId: asset.id,
        },
      },
      data: {
        totalSharesPurchased: onchainShares,
        totalKzteSpent: recalculatedTotalSpent,
        averagePricePerShare,
        status: onchainShares > 0 ? 'ACTIVE' : 'CLOSED',
      },
    });

    return {
      assetId: asset.assetId,
      energyAssetId: asset.id,
      buyerShareAccount: position.buyerShareAccount,
      onchainShares,
      recalculatedTotalSpent,
      updated,
    };
  }

  public async getPortfolio(energyUserId: string) {
    return this.prisma.energyInvestorPosition.findMany({
      where: {
        energyUserId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }
}