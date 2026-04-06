import type { Request } from 'express';
import { EnergyAssetsService } from './energy-assets.service';
import { AssetAccessService } from '@/modules/asset-access/asset-access.service';
type AuthenticatedRequest = Request & {
    user: {
        id: string;
    };
};
export declare class PrivateAssetsController {
    private readonly energyAssetsService;
    private readonly assetAccessService;
    constructor(energyAssetsService: EnergyAssetsService, assetAccessService: AssetAccessService);
    getPrivateAssetDetail(assetId: string, req: AuthenticatedRequest): Promise<{
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
            proofRootHash: string;
            createdAt: Date;
            energyAssetId: string;
            bundleVersion: number;
            manifestJson: import("prisma/generated/client/runtime/library").JsonValue;
            createdByEnergyUserId: string | null;
        } | null;
    }>;
}
export {};
