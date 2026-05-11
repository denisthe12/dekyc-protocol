import { IsString } from 'class-validator';

export class DekycConnectExchangeDto {
  @IsString()
  code!: string;

  @IsString()
  redirectUri!: string;
}