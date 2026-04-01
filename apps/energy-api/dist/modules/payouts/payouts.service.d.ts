import { EnergyPointsService } from '@/modules/solana/energy-points.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { AnchorService } from '@/modules/solana/anchor.service';
import { SolanaService } from '@/modules/solana/solana.service';
export declare class PayoutsService {
    private readonly prisma;
    private readonly anchorService;
    private readonly solanaService;
    private readonly energyPointsService;
    constructor(prisma: PrismaService, anchorService: AnchorService, solanaService: SolanaService, energyPointsService: EnergyPointsService);
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
            treasuryKzteAccount: string;
            status: import("prisma/generated/client").$Enums.EnergyRevenueEpochStatus;
            createdAt: Date;
            updatedAt: Date;
            energyAssetId: string;
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
        payoutMode: "KZTE";
        tx: string;
        energyPointsMintTx: string | null;
        db: {
            id: string;
            payoutMode: import("prisma/generated/client").$Enums.EnergyPositionPayoutMode;
            createdAt: Date;
            updatedAt: Date;
            energyAssetId: string;
            energyUserId: string;
            claimerKzteAccount: string;
            claimerShareAccount: string;
            energyRevenueEpochId: string;
            claimReceiptPda: string;
            claimerWalletAddress: string;
            claimedAmountKzte: number;
            claimTx: string | null;
            energyPointsMintTx: string | null;
        };
    }>;
    listEpochs(assetId: string): Promise<{
        id: string;
        treasuryKzteAccount: string;
        status: import("prisma/generated/client").$Enums.EnergyRevenueEpochStatus;
        createdAt: Date;
        updatedAt: Date;
        energyAssetId: string;
        epochIndex: number;
        revenueEpochPda: string;
        totalAmountKzte: number;
        amountPerShareKzte: number;
        totalSharesSnapshot: number;
        createEpochTx: string | null;
    }[]>;
    listClaimsForUser(params: {
        energyUserId: string;
        assetId?: string;
    }): Promise<{
        id: string;
        payoutMode: import("prisma/generated/client").$Enums.EnergyPositionPayoutMode;
        createdAt: Date;
        updatedAt: Date;
        energyAssetId: string;
        energyUserId: string;
        claimerKzteAccount: string;
        claimerShareAccount: string;
        energyRevenueEpochId: string;
        claimReceiptPda: string;
        claimerWalletAddress: string;
        claimedAmountKzte: number;
        claimTx: string | null;
        energyPointsMintTx: string | null;
    }[]>;
}
