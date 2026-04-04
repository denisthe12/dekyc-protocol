import { EnergyAssetsService } from './energy-assets.service';
export declare class PrivateAssetsController {
    private readonly energyAssetsService;
    constructor(energyAssetsService: EnergyAssetsService);
    getPrivateAssetDetail(assetId: string): Promise<{
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
        documents: {
            id: string;
            createdAt: Date;
            energyAssetId: string;
            documentType: import("prisma/generated/client").$Enums.EnergyAssetDocumentType;
            fileName: string;
            mimeType: string;
            storageKey: string;
            fileUrl: string;
            sha256Hash: string;
            sizeBytes: number;
            uploadedByEnergyUserId: string | null;
        }[];
        latestProofBundle: {
            id: string;
            createdAt: Date;
            energyAssetId: string;
            proofRootHash: string;
            bundleVersion: number;
            manifestJson: import("prisma/generated/client/runtime/library").JsonValue;
            createdByEnergyUserId: string | null;
        } | null;
    }>;
}
