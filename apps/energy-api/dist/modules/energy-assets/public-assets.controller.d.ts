import { EnergyAssetsService } from './energy-assets.service';
export declare class PublicAssetsController {
    private readonly energyAssetsService;
    constructor(energyAssetsService: EnergyAssetsService);
    listPublicAssets(): Promise<{
        assetId: string;
        title: string;
        description: string | null;
        location: string | null;
        assetType: string;
        totalShares: number;
        soldShares: number;
        remainingShares: number;
        pricePerShareKzte: number;
        investorBps: number;
        operatorBps: number;
        status: import("prisma/generated/client").$Enums.EnergyAssetStatus;
        coverImageUrl: string;
        metadataJson: import("prisma/generated/client/runtime/library").JsonValue;
        supportedPayoutModes: string[];
    }[]>;
    getPublicAssetPreview(assetId: string): Promise<{
        accessLevel: string;
        assetId: string;
        title: string;
        description: string | null;
        location: string | null;
        assetType: string;
        totalShares: number;
        soldShares: number;
        remainingShares: number;
        pricePerShareKzte: number;
        investorBps: number;
        operatorBps: number;
        status: import("prisma/generated/client").$Enums.EnergyAssetStatus;
        coverImageUrl: string;
        proofRootHash: string;
        metadataUriHash: string;
        assetPda: string;
        registryPda: string;
        shareMintAddress: string;
        treasuryShareAccount: string;
        treasuryKzteAccount: string;
        createAssetTx: string | null;
        issueSharesTx: string | null;
        metadataJson: import("prisma/generated/client/runtime/library").JsonValue;
        latestProofBundle: {
            id: string;
            proofRootHash: string;
            createdAt: Date;
            energyAssetId: string;
            bundleVersion: number;
            manifestJson: import("prisma/generated/client/runtime/library").JsonValue;
            createdByEnergyUserId: string | null;
        } | null;
    }>;
}
