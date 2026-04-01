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
    claim(dto: ClaimPayoutDto): Promise<{
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
    listClaims(energyUserId: string, assetId?: string): Promise<{
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
