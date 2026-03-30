import { IsInt, IsPositive, IsString, Min } from 'class-validator';

export class BuyDemoSharesDto {
  @IsString()
  energyUserId!: string;

  @IsString()
  assetId!: string;

  @IsInt()
  @Min(1)
  shareAmount!: number;
}