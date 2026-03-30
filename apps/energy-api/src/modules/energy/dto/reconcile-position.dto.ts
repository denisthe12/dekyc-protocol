import { IsString } from 'class-validator';

export class ReconcilePositionDto {
  @IsString()
  energyUserId!: string;

  @IsString()
  assetId!: string;
}