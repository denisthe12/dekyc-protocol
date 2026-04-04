import { IsOptional, IsString } from 'class-validator';

export class RebuildProofBundleDto {
  @IsOptional()
  @IsString()
  createdByEnergyUserId?: string;
}