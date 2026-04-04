import { EnergyAssetDocumentType } from '../../../../prisma/generated/client';
export declare class UploadAssetDocumentDto {
    documentType: EnergyAssetDocumentType;
    originalFileName?: string;
}
