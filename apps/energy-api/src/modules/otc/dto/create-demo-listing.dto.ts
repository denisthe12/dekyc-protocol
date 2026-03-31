import { IsInt, IsString, Min } from 'class-validator';

export class CreateDemoListingDto {
  @IsString()
  energyUserId!: string;

  @IsString()
  assetId!: string;

  @IsInt()
  @Min(1)
  shareAmount!: number;

  @IsInt()
  @Min(1)
  pricePerShareKzte!: number;
}