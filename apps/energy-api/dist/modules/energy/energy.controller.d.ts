import { EnergyBlockchainService } from './energy-blockchain.service';
import { EnergyAssetsService } from '@/modules/energy-assets/energy-assets.service';
export declare class EnergyController {
    private readonly energyBlockchainService;
    private readonly energyAssetsService;
    constructor(energyBlockchainService: EnergyBlockchainService, energyAssetsService: EnergyAssetsService);
    createRegistry(): Promise<{
        registryPda: string;
        tx: string | null;
    }>;
    createAsset(): Promise<import("./energy-blockchain.service").CreatedEnergyAssetResult>;
    createDemoAsset(): Promise<{
        onchain: import("./energy-blockchain.service").CreatedEnergyAssetResult;
        db: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("prisma/generated/client").$Enums.EnergyAssetStatus;
            registryPda: string;
            assetPda: string;
            treasuryShareAccount: string;
            createAssetTx: string | null;
            issueSharesTx: string | null;
            assetId: string;
            issuerEnergyUserId: string | null;
            title: string;
            description: string | null;
            location: string | null;
            assetType: string;
            totalShares: number;
            pricePerShareKzte: number;
            investorBps: number;
            operatorBps: number;
            payoutMode: string;
            shareMintAddress: string;
            proofRootHash: string;
            metadataUriHash: string;
        };
    }>;
    listAssets(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("prisma/generated/client").$Enums.EnergyAssetStatus;
        registryPda: string;
        assetPda: string;
        treasuryShareAccount: string;
        createAssetTx: string | null;
        issueSharesTx: string | null;
        assetId: string;
        issuerEnergyUserId: string | null;
        title: string;
        description: string | null;
        location: string | null;
        assetType: string;
        totalShares: number;
        pricePerShareKzte: number;
        investorBps: number;
        operatorBps: number;
        payoutMode: string;
        shareMintAddress: string;
        proofRootHash: string;
        metadataUriHash: string;
    }[]>;
}
