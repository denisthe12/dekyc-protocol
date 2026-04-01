import { IsIn, IsInt, IsString, Min } from 'class-validator';

export class BuyDemoSharesDto {
  @IsString()
  energyUserId!: string;

  @IsString()
  assetId!: string;

  @IsInt()
  @Min(1)
  shareAmount!: number;

  @IsString()
  @IsIn(['KZTE', 'ENERGY_POINTS'])
  payoutMode!: 'KZTE' | 'ENERGY_POINTS';
}