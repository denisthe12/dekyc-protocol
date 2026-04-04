import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EnergyAssetDocumentType } from '../../../../prisma/generated/client';

export class UploadAssetDocumentDto {
  @IsEnum(EnergyAssetDocumentType)
  documentType!: EnergyAssetDocumentType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  originalFileName?: string;
}