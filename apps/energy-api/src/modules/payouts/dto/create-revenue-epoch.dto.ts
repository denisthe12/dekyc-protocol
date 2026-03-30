import { IsInt, IsString, Min } from 'class-validator';

export class CreateRevenueEpochDto {
  @IsString()
  assetId!: string;

  @IsInt()
  @Min(1)
  totalAmountKzte!: number;
}