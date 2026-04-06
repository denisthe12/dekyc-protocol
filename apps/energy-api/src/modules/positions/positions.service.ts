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
    spentKzte: number;
    payoutMode: 'KZTE' | 'ENERGY_POINTS';
    purchaseTx: string;
  }) {
    const existing = await this.prisma.energyInvestorPosition.findUnique({
      where: {
        energyUserId_energyAssetId_payoutMode: {
          energyUserId: params.energyUserId,
          energyAssetId: params.energyAssetId,
          payoutMode: params.payoutMode,
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
          payoutMode: params.payoutMode,
          totalSharesPurchased: params.purchasedShares,
          totalKzteSpent: params.spentKzte,
          averagePricePerShare: Math.floor(
            params.spentKzte / params.purchasedShares,
          ),
          lastPurchaseTx: params.purchaseTx,
          status: 'ACTIVE',
        },
      });
    }

    const newShares = existing.totalSharesPurchased + params.purchasedShares;
    const newSpent = existing.totalKzteSpent + params.spentKzte;

    return this.prisma.energyInvestorPosition.update({
      where: {
        id: existing.id,
      },
      data: {
        assetId: params.assetId,
        assetPda: params.assetPda,
        shareMintAddress: params.shareMintAddress,
        buyerWalletAddress: params.buyerWalletAddress,
        buyerKzteAccount: params.buyerKzteAccount,
        buyerShareAccount: params.buyerShareAccount,
        payoutMode: params.payoutMode,
        totalSharesPurchased: newShares,
        totalKzteSpent: newSpent,
        averagePricePerShare: Math.floor(newSpent / newShares),
        lastPurchaseTx: params.purchaseTx,
        status: 'ACTIVE',
      },
    });
  }

  public async reconcilePosition(params: {
    energyUserId: string;
    assetId: string;
    payoutMode: 'KZTE' | 'ENERGY_POINTS';
  }) {
    const asset = await this.prisma.energyAsset.findUniqueOrThrow({
      where: {
        assetId: params.assetId,
      },
    });

    const position = await this.prisma.energyInvestorPosition.findUnique({
      where: {
        energyUserId_energyAssetId_payoutMode: {
          energyUserId: params.energyUserId,
          energyAssetId: asset.id,
          payoutMode: params.payoutMode,
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
        energyUserId_energyAssetId_payoutMode: {
          energyUserId: params.energyUserId,
          energyAssetId: asset.id,
          payoutMode: params.payoutMode,
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

  public async recordPrimaryBuyTx(params: {
    energyUserId: string;
    energyAssetId: string;
    assetId: string;
    assetPda: string;
    shareMintAddress: string;
    buyerWalletAddress: string;
    buyerKzteAccount: string | null;
    buyerShareAccount: string;
    payoutMode: 'KZTE' | 'ENERGY_POINTS';
    shareAmount: number;
    pricePerShareKzte: number;
    totalKzteSpent: number;
    txSignature: string;
  }) {
    return this.prisma.energyPrimaryBuyTx.create({
      data: {
        energyUserId: params.energyUserId,
        energyAssetId: params.energyAssetId,
        assetId: params.assetId,
        assetPda: params.assetPda,
        shareMintAddress: params.shareMintAddress,
        buyerWalletAddress: params.buyerWalletAddress,
        buyerKzteAccount: params.buyerKzteAccount,
        buyerShareAccount: params.buyerShareAccount,
        payoutMode: params.payoutMode,
        shareAmount: params.shareAmount,
        pricePerShareKzte: params.pricePerShareKzte,
        totalKzteSpent: params.totalKzteSpent,
        txSignature: params.txSignature,
      },
    });
  }
}