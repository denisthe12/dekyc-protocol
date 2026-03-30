import { PublicKey } from '@solana/web3.js';
import { AnchorService } from '@/modules/solana/anchor.service';
import { SolanaService } from '@/modules/solana/solana.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
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
    constructor(anchorService: AnchorService, solanaService: SolanaService, prisma: PrismaService);
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
    }): Promise<{
        assetId: string;
        assetPda: string;
        buyerWallet: string;
        buyerKzteAccount: string | null;
        buyerShareAccount: string;
        treasuryKzteAccount: string;
        treasuryShareAccount: string;
        tx: string;
    }>;
}
