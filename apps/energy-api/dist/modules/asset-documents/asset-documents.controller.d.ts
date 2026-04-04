import { AssetDocumentsService } from './asset-documents.service';
import { UploadAssetDocumentDto } from './dto/upload-asset-document.dto';
import { RebuildProofBundleDto } from './dto/rebuild-proof-bundle.dto';
export declare class AssetDocumentsController {
    private readonly assetDocumentsService;
    constructor(assetDocumentsService: AssetDocumentsService);
    listDocuments(assetId: string): Promise<{
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
    }[]>;
    uploadDocument(assetId: string, dto: UploadAssetDocumentDto, file?: Express.Multer.File): Promise<{
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
    }>;
    rebuildProofBundle(assetId: string, dto: RebuildProofBundleDto): Promise<{
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
}
