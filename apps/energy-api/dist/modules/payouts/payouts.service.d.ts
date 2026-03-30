import { PrismaService } from '@/modules/prisma/prisma.service';
import { AnchorService } from '@/modules/solana/anchor.service';
import { SolanaService } from '@/modules/solana/solana.service';
export declare class PayoutsService {
    private readonly prisma;
    private readonly anchorService;
    private readonly solanaService;
    constructor(prisma: PrismaService, anchorService: AnchorService, solanaService: SolanaService);
    createRevenueEpoch(params: {
        assetId: string;
        totalAmountKzte: number;
    }): Promise<{
        assetId: string;
        epochIndex: number;
        revenueEpochPda: string;
        createEpochTx: string;
        db: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("prisma/generated/client").$Enums.EnergyRevenueEpochStatus;
            energyAssetId: string;
            treasuryKzteAccount: string;
            epochIndex: number;
            revenueEpochPda: string;
            totalAmountKzte: number;
            amountPerShareKzte: number;
            totalSharesSnapshot: number;
            createEpochTx: string | null;
        };
    }>;
    claimPayout(params: {
        energyUserId: string;
        assetId: string;
        epochIndex: number;
    }): Promise<{
        assetId: string;
        epochIndex: number;
        claimReceiptPda: string;
        claimedAmountKzte: number;
        tx: string;
        db: {
            id: string;
            energyUserId: string;
            createdAt: Date;
            updatedAt: Date;
            energyAssetId: string;
            claimReceiptPda: string;
            claimerKzteAccount: string;
            claimerShareAccount: string;
            energyRevenueEpochId: string;
            claimerWalletAddress: string;
            claimedAmountKzte: number;
            claimTx: string | null;
        };
    }>;
    listEpochs(assetId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("prisma/generated/client").$Enums.EnergyRevenueEpochStatus;
        energyAssetId: string;
        treasuryKzteAccount: string;
        epochIndex: number;
        revenueEpochPda: string;
        totalAmountKzte: number;
        amountPerShareKzte: number;
        totalSharesSnapshot: number;
        createEpochTx: string | null;
    }[]>;
}
