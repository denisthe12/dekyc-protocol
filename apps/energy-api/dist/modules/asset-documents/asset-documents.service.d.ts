import { PrismaService } from '@/modules/prisma/prisma.service';
import { EnergyAssetDocumentType } from '../../../prisma/generated/client';
type UploadDocumentParams = {
    assetId: string;
    documentType: EnergyAssetDocumentType;
    uploadedByEnergyUserId?: string;
    file: {
        buffer: Buffer;
        mimetype: string;
        originalname: string;
        size: number;
    };
};
export declare class AssetDocumentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getStorageRoot;
    private ensureAssetExists;
    private sha256Hex;
    private toCanonicalJson;
    uploadDocument(params: UploadDocumentParams): Promise<{
        id: string;
        createdAt: Date;
        energyAssetId: string;
        documentType: import("../../../prisma/generated/client").$Enums.EnergyAssetDocumentType;
        fileName: string;
        mimeType: string;
        storageKey: string;
        fileUrl: string;
        sha256Hash: string;
        sizeBytes: number;
        uploadedByEnergyUserId: string | null;
    }>;
    rebuildProofBundle(params: {
        assetId: string;
        createdByEnergyUserId?: string;
    }): Promise<{
        assetId: string;
        bundleVersion: number;
        proofRootHash: string;
        documentCount: number;
        bundle: {
            id: string;
            createdAt: Date;
            energyAssetId: string;
            proofRootHash: string;
            bundleVersion: number;
            manifestJson: import("prisma/generated/client/runtime/library").JsonValue;
            createdByEnergyUserId: string | null;
        };
    }>;
    listDocuments(assetId: string): Promise<{
        id: string;
        createdAt: Date;
        energyAssetId: string;
        documentType: import("../../../prisma/generated/client").$Enums.EnergyAssetDocumentType;
        fileName: string;
        mimeType: string;
        storageKey: string;
        fileUrl: string;
        sha256Hash: string;
        sizeBytes: number;
        uploadedByEnergyUserId: string | null;
    }[]>;
}
export {};
