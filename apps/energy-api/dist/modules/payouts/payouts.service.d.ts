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
    private claimBucket;
    claimPayout(params: {
        energyUserId: string;
        assetId: string;
        epochIndex: number;
    }): Promise<{
        assetId: string;
        epochIndex: number;
        totalKzteClaimAmount: number;
        totalEnergyPointsClaimAmount: number;
        claims: {
            investorPositionPda: string;
            claimReceiptPda: string;
            claimAmount: number;
            payoutMode: "KZTE" | "ENERGY_POINTS";
            tx: string;
            energyPointsMintTx: string | null;
            db: {
                id: string;
                energyUserId: string;
                createdAt: Date;
                updatedAt: Date;
                energyAssetId: string;
                payoutMode: import("prisma/generated/client").$Enums.EnergyPositionPayoutMode;
                claimReceiptPda: string;
                claimerKzteAccount: string;
                energyRevenueEpochId: string;
                claimerWalletAddress: string;
                claimerShareAccount: string;
                claimedAmountKzte: number;
                claimedAmountEnergyPoints: number;
                claimTx: string | null;
                energyPointsMintTx: string | null;
            };
        }[];
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
    listClaimsForUser(params: {
        energyUserId: string;
        assetId?: string;
    }): Promise<{
        id: string;
        energyUserId: string;
        createdAt: Date;
        updatedAt: Date;
        energyAssetId: string;
        payoutMode: import("prisma/generated/client").$Enums.EnergyPositionPayoutMode;
        claimReceiptPda: string;
        claimerKzteAccount: string;
        energyRevenueEpochId: string;
        claimerWalletAddress: string;
        claimerShareAccount: string;
        claimedAmountKzte: number;
        claimedAmountEnergyPoints: number;
        claimTx: string | null;
        energyPointsMintTx: string | null;
    }[]>;
}
