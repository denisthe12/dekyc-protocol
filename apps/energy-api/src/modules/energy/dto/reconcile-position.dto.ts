import { IsString, IsIn } from 'class-validator';

export class ReconcilePositionDto {
  @IsString()
  energyUserId!: string;

  @IsString()
  assetId!: string;

  @IsString()
  @IsIn(['KZTE', 'ENERGY_POINTS'])
  payoutMode!: 'KZTE' | 'ENERGY_POINTS';
}