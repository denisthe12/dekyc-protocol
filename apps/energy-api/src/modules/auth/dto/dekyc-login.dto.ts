import { IsOptional, IsString } from 'class-validator';

export class DekycLoginDto {
  @IsString()
  biometricMockId!: string;

  @IsString()
  loginCode!: string;

  @IsOptional()
  requestedClaims?: string[];
}