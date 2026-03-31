import { IsString } from 'class-validator';

export class FillDemoListingDto {
  @IsString()
  energyUserId!: string;

  @IsString()
  listingId!: string;
}