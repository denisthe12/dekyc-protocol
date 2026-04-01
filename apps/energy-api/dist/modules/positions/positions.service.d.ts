import { PrismaService } from '@/modules/prisma/prisma.service';
import { SolanaService } from '@/modules/solana/solana.service';
export declare class PositionsService {
    private readonly prisma;
    private readonly solanaService;
    constructor(prisma: PrismaService, solanaService: SolanaService);
    recordPurchase(params: {
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
    }): Promise<{
        id: string;
        energyUserId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("prisma/generated/client").$Enums.EnergyPositionStatus;
        energyAssetId: string;
        assetId: string;
        assetPda: string;
        shareMintAddress: string;
        buyerWalletAddress: string;
        buyerKzteAccount: string | null;
        buyerShareAccount: string;
        payoutMode: import("prisma/generated/client").$Enums.EnergyPositionPayoutMode;
        totalSharesPurchased: number;
        totalKzteSpent: number;
        averagePricePerShare: number;
        lastPurchaseTx: string | null;
    }>;
    reconcilePosition(params: {
        energyUserId: string;
        assetId: string;
        payoutMode: 'KZTE' | 'ENERGY_POINTS';
    }): Promise<{
        assetId: string;
        energyAssetId: string;
        buyerShareAccount: string;
        onchainShares: number;
        recalculatedTotalSpent: number;
        updated: {
            id: string;
            energyUserId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("prisma/generated/client").$Enums.EnergyPositionStatus;
            energyAssetId: string;
            assetId: string;
            assetPda: string;
            shareMintAddress: string;
            buyerWalletAddress: string;
            buyerKzteAccount: string | null;
            buyerShareAccount: string;
            payoutMode: import("prisma/generated/client").$Enums.EnergyPositionPayoutMode;
            totalSharesPurchased: number;
            totalKzteSpent: number;
            averagePricePerShare: number;
            lastPurchaseTx: string | null;
        };
    }>;
    getPortfolio(energyUserId: string): Promise<{
        id: string;
        energyUserId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("prisma/generated/client").$Enums.EnergyPositionStatus;
        energyAssetId: string;
        assetId: string;
        assetPda: string;
        shareMintAddress: string;
        buyerWalletAddress: string;
        buyerKzteAccount: string | null;
        buyerShareAccount: string;
        payoutMode: import("prisma/generated/client").$Enums.EnergyPositionPayoutMode;
        totalSharesPurchased: number;
        totalKzteSpent: number;
        averagePricePerShare: number;
        lastPurchaseTx: string | null;
    }[]>;
}
