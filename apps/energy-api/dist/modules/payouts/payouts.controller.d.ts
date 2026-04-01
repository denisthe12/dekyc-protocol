import { PayoutsService } from './payouts.service';
import { CreateRevenueEpochDto } from './dto/create-revenue-epoch.dto';
import { ClaimPayoutDto } from './dto/claim-payout.dto';
export declare class PayoutsController {
    private readonly payoutsService;
    constructor(payoutsService: PayoutsService);
    createEpoch(dto: CreateRevenueEpochDto): Promise<{
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
    claim(dto: ClaimPayoutDto): Promise<{
        assetId: string;
        epochIndex: number;
        claimReceiptPda: string;
        claimedAmountKzte: number;
        payoutMode: string;
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
            claimerShareAccount: string;
            energyRevenueEpochId: string;
            claimerWalletAddress: string;
            claimedAmountKzte: number;
            claimTx: string | null;
            energyPointsMintTx: string | null;
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
    listClaims(energyUserId: string, assetId?: string): Promise<{
        id: string;
        energyUserId: string;
        createdAt: Date;
        updatedAt: Date;
        energyAssetId: string;
        payoutMode: import("prisma/generated/client").$Enums.EnergyPositionPayoutMode;
        claimReceiptPda: string;
        claimerKzteAccount: string;
        claimerShareAccount: string;
        energyRevenueEpochId: string;
        claimerWalletAddress: string;
        claimedAmountKzte: number;
        claimTx: string | null;
        energyPointsMintTx: string | null;
    }[]>;
}
