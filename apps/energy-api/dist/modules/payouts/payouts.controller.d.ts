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
