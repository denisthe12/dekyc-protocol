import { PublicKey } from '@solana/web3.js';
import { AnchorService } from '@/modules/solana/anchor.service';
import { SolanaService } from '@/modules/solana/solana.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { PositionsService } from '../positions/positions.service';
export type CreatedEnergyAssetResult = {
    registryPda: string;
    registryTx: string | null;
    assetId: string;
    assetPda: string;
    shareMint: string;
    treasuryShareAccount: string;
    treasuryKzteAccount: string;
    createAssetTx: string;
    issueSharesTx: string;
    metadata: {
        title: string;
        description: string;
        location: string;
        assetType: string;
        totalShares: number;
        pricePerShareKzte: number;
        investorBps: number;
        operatorBps: number;
        payoutMode: string;
        createdAt: string;
    };
    metadataHash: string;
};
export declare class EnergyBlockchainService {
    private readonly anchorService;
    private readonly solanaService;
    private readonly prisma;
    private readonly positionsService;
    constructor(anchorService: AnchorService, solanaService: SolanaService, prisma: PrismaService, positionsService: PositionsService);
    getRegistryPda(): Promise<PublicKey>;
    createRegistryIfNeeded(): Promise<{
        registryPda: string;
        tx: string | null;
    }>;
    createEnergyAsset(): Promise<CreatedEnergyAssetResult>;
    buyDemoShares(params: {
        energyUserId: string;
        assetId: string;
        shareAmount: number;
        payoutMode: 'KZTE' | 'ENERGY_POINTS';
    }): Promise<{
        assetId: string;
        assetPda: string;
        buyerWallet: string;
        buyerKzteAccount: string | null;
        buyerShareAccount: string;
        treasuryKzteAccount: string;
        treasuryShareAccount: string;
        tx: string;
        position: {
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
            totalSharesPurchased: number;
            totalKzteSpent: number;
            averagePricePerShare: number;
            payoutMode: import("prisma/generated/client").$Enums.EnergyPositionPayoutMode;
            lastPurchaseTx: string | null;
        };
    }>;
    getInvestorPosition(params: {
        assetPda: string;
        investorWallet: string;
    }): Promise<{
        investorPositionPda: string;
        investorPosition: any;
    }>;
}
