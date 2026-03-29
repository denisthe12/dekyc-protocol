import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TokenCheckDto {
  @IsString()
  scope!: string;

  @IsBoolean()
  ok!: boolean;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  readError!: string | null;

  @IsOptional()
  @IsString()
  tokenAccountAddress!: string | null;

  @IsOptional()
  @IsString()
  mintAddress!: string | null;

  @IsNumber()
  balance!: number;

  @IsNumber()
  requiredAmount!: number;
}

class ScopeGrantRefDto {
  @IsString()
  scope!: string;

  @IsOptional()
  @IsString()
  mintAddress!: string | null;

  @IsOptional()
  @IsString()
  tokenAccountAddress!: string | null;

  @IsNumber()
  requiredAmount!: number;

  @IsOptional()
  @IsString()
  balanceCheckMode?: string;
}

class PolicyDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedClaims?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requestedClaims?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedScopes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requestedScopes?: string[];
}

class EnvelopePayloadDto {
  @IsBoolean()
  allowed!: boolean;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsObject()
  claims?: Record<string, unknown> | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  grantedClaims?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  grantedScopes?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TokenCheckDto)
  tokenChecks?: TokenCheckDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScopeGrantRefDto)
  scopeGrantRefs?: ScopeGrantRefDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PolicyDto)
  policy?: PolicyDto;
}

class EnvelopeMetaDto {
  @IsNumber()
  timestamp!: number;

  @IsString()
  nonce!: string;
}

class SignedEnvelopeDto {
  @ValidateNested()
  @Type(() => EnvelopePayloadDto)
  payload!: EnvelopePayloadDto;

  @ValidateNested()
  @Type(() => EnvelopeMetaDto)
  meta!: EnvelopeMetaDto;

  @IsOptional()
  @IsString()
  signature!: string | null;

  @IsString()
  resolvedUserId!: string;
}

export class DekycLoginCallbackDto {
  @ValidateNested()
  @Type(() => SignedEnvelopeDto)
  envelope!: SignedEnvelopeDto;
}