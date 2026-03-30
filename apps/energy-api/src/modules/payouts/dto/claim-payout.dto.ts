import { IsInt, IsString, Min } from 'class-validator';

export class ClaimPayoutDto {
  @IsString()
  energyUserId!: string;

  @IsString()
  assetId!: string;

  @IsInt()
  @Min(1)
  epochIndex!: number;
}