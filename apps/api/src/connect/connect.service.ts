import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import type {
  DeKycClaimKey,
  DeKycTokenResponseDto,
} from '@energy/shared';
import type { Prisma } from '../../prisma/generated/client';
import { ConsentReceiptsService } from '../consent-receipts/consent-receipts.service';
import { IdentityAssertionsService } from '../identity-assertions/identity-assertions.service';
import { PrismaService } from '../prisma/prisma.service';
import { ServicesService } from '../services/services.service';
import type { AuthorizeQueryDto } from './dto/authorize-query.dto';
import type { CompleteAuthorizationDto } from './dto/complete-authorization.dto';
import type { TokenRequestDto } from './dto/token-request.dto';
import type { CompleteAuthorizationResult } from './types/complete-authorization-result.type';

interface ServiceAuthContext {
  serviceId: string;
  clientId: string;
}

@Injectable()
export class ConnectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly servicesService: ServicesService,
    private readonly consentReceiptsService: ConsentReceiptsService,
    private readonly identityAssertionsService: IdentityAssertionsService,
  ) {}

  async previewAuthorizeRequest(query: AuthorizeQueryDto) {
    const clientId = this.getClientIdFromAuthorizeQuery(query);
    const redirectUri = this.normalizeRedirectUri(
      query.redirect_uri ?? query.redirectUri,
    );
    const responseType = query.response_type ?? query.responseType ?? 'code';

    if (responseType !== 'code') {
      throw new BadRequestException('unsupported_response_type');
    }

    const service = await this.servicesService.getServiceByClientIdWithSecrets(
      clientId,
    );

    if (!service || service.status !== 'active') {
      throw new UnauthorizedException('invalid_client');
    }

    const claimsScope = this.parseClaimsScope(query.scope);

    return {
      status: 'authorization_request_ready',
      nextAction: 'hosted_consent_ui_required',
      service: {
        id: service.id,
        name: service.name,
        clientId: service.clientId,
      },
      authorizationRequest: {
        responseType: 'code',
        clientId,
        redirectUri,
        scope: claimsScope,
        state: query.state ?? null,
        nonce: query.nonce ?? null,
      },
      note: 'MVP preview endpoint. Use POST /api/connect/dev/authorize/complete to simulate hosted consent until UI is connected.',
    };
  }

  async completeAuthorizationForDev(
    input: CompleteAuthorizationDto,
    masterSecret: string | undefined,
  ): Promise<CompleteAuthorizationResult> {
    this.assertDevCompleteAllowed(masterSecret);

    const clientId = this.normalizeRequiredString(input.clientId, 'clientId');
    const redirectUri = this.normalizeRedirectUri(input.redirectUri);

    const service = await this.servicesService.getServiceByClientIdWithSecrets(
      clientId,
    );

    if (!service || service.status !== 'active') {
      throw new UnauthorizedException('invalid_client');
    }

    const userId = await this.resolveUserIdForDev(input);
    const claimsScope = this.parseClaimsScope(input.scope);
    const code = this.generateAuthorizationCode();
    const codeHash = this.hashAuthorizationCode(code);
    const expiresAt = this.buildCodeExpiresAt();

    const consentReceipt =
      await this.consentReceiptsService.createConsentReceipt({
        userId,
        serviceId: service.id,
        grantedClaims: claimsScope,
        consentTextVersion:
          input.consentTextVersion?.trim() || 'dekyc-connect-consent-v1',
        expiresAt: this.buildConsentExpiresAt(input.consentExpiresInSeconds),
      });

    await this.prisma.deKycAuthorizationCode.create({
      data: {
        codeHash,
        userId,
        serviceId: service.id,
        redirectUri,
        state: input.state?.trim() || null,
        nonce: input.nonce?.trim() || null,
        claimsScope: this.toJsonArray(claimsScope),
        consentId: consentReceipt.consentId,
        expiresAt,
        consumedAt: null,
      },
    });

    return {
      code,
      redirectUri,
      redirectUriWithCode: this.buildRedirectUriWithCode({
        redirectUri,
        code,
        state: input.state,
      }),
      consentId: consentReceipt.consentId,
      serviceSubjectId: consentReceipt.serviceSubjectId,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async exchangeAuthorizationCode(input: {
    body: TokenRequestDto;
    serviceAuth: ServiceAuthContext;
  }): Promise<DeKycTokenResponseDto> {
    const grantType = input.body.grant_type ?? input.body.grantType;

    if (grantType !== 'authorization_code') {
      throw new BadRequestException('unsupported_grant_type');
    }

    const bodyClientId = input.body.client_id ?? input.body.clientId;

    if (bodyClientId && bodyClientId !== input.serviceAuth.clientId) {
      throw new UnauthorizedException('client_id_mismatch');
    }

    const code = this.normalizeRequiredString(input.body.code, 'code');
    const redirectUri = this.normalizeRedirectUri(
      input.body.redirect_uri ?? input.body.redirectUri,
    );
    const codeHash = this.hashAuthorizationCode(code);

    const authorizationCode =
      await this.prisma.deKycAuthorizationCode.findUnique({
        where: {
          codeHash,
        },
      });

    if (!authorizationCode) {
      throw new BadRequestException('code_not_found');
    }

    if (authorizationCode.serviceId !== input.serviceAuth.serviceId) {
      throw new ForbiddenException('code_belongs_to_another_service');
    }

    if (authorizationCode.redirectUri !== redirectUri) {
      throw new BadRequestException('invalid_redirect_uri');
    }

    if (authorizationCode.consumedAt) {
      throw new BadRequestException('code_consumed');
    }

    if (authorizationCode.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('code_expired');
    }

    const consumeResult = await this.prisma.deKycAuthorizationCode.updateMany({
      where: {
        codeHash,
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    if (consumeResult.count !== 1) {
      throw new BadRequestException('code_consumed');
    }

    const claimsScope = this.readClaimsScope(authorizationCode.claimsScope);

    const identityAssertion =
      await this.identityAssertionsService.createIdentityAssertion({
        userId: authorizationCode.userId,
        serviceId: authorizationCode.serviceId,
        consentId: authorizationCode.consentId,
        claimsScope,
      });

    const consentReceipt =
      await this.consentReceiptsService.getConsentReceipt({
        consentId: authorizationCode.consentId,
        serviceId: authorizationCode.serviceId,
      });

    return {
      tokenType: 'dekyc_identity_assertion',
      expiresIn: Math.max(
        0,
        identityAssertion.payload.exp - Math.floor(Date.now() / 1000),
      ),
      identityAssertion,
      consentReceipt,
      minimalClaims: await this.buildMinimalClaims({
        userId: authorizationCode.userId,
        claimsScope,
      }),
    };
  }

  private getClientIdFromAuthorizeQuery(query: AuthorizeQueryDto): string {
    return this.normalizeRequiredString(
      query.client_id ?? query.clientId,
      'client_id',
    );
  }

  private async resolveUserIdForDev(
    input: CompleteAuthorizationDto,
  ): Promise<string> {
    if (input.userId?.trim()) {
      return input.userId.trim();
    }

    if (!input.userEmail?.trim()) {
      throw new BadRequestException('userId_or_userEmail_required');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email: input.userEmail.trim(),
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new BadRequestException('user_not_found');
    }

    return user.id;
  }

  private async buildMinimalClaims(input: {
    userId: string;
    claimsScope: DeKycClaimKey[];
  }): Promise<Partial<Record<DeKycClaimKey, string | boolean>>> {
    const profile = await this.prisma.kycProfile.findFirst({
      where: {
        userId: input.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const claims: Partial<Record<DeKycClaimKey, string | boolean>> = {};

    if (!profile) {
      if (input.claimsScope.includes('verified')) {
        claims.verified = false;
      }

      return claims;
    }

    const fullName =
      profile.fullName ||
      [profile.lastName, profile.firstName, profile.middleName]
        .filter(Boolean)
        .join(' ');

    if (input.claimsScope.includes('fullName') && fullName) {
      claims.fullName = fullName;
    }

    if (input.claimsScope.includes('iin') && profile.iin) {
      claims.iin = profile.iin;
    }

    if (input.claimsScope.includes('birthDate') && profile.birthDate) {
      claims.birthDate = profile.birthDate;
    }

    if (input.claimsScope.includes('email') && profile.email) {
      claims.email = profile.email;
    }

    if (input.claimsScope.includes('verified')) {
      claims.verified = profile.status === 'verified';
    }

    if (input.claimsScope.includes('age18Plus') && profile.birthDate) {
      const age18Plus = this.calculateAge18Plus(profile.birthDate);

      if (age18Plus !== null) {
        claims.age18Plus = age18Plus;
      }
    }

    return claims;
  }

  private calculateAge18Plus(birthDate: string): boolean | null {
    const parsedBirthDate = new Date(birthDate);

    if (Number.isNaN(parsedBirthDate.getTime())) {
      return null;
    }

    const now = new Date();
    const eighteenYearsAgo = new Date(
      now.getFullYear() - 18,
      now.getMonth(),
      now.getDate(),
    );

    return parsedBirthDate <= eighteenYearsAgo;
  }

  private parseClaimsScope(value: unknown): DeKycClaimKey[] {
    const rawClaims = Array.isArray(value)
      ? value
      : typeof value === 'string'
        ? value.split(/[,\s]+/)
        : [];

    const claims = rawClaims
      .map((item) => String(item).trim())
      .filter((item): item is DeKycClaimKey => this.isClaimKey(item));

    const uniqueClaims = [...new Set(claims)].sort();

    if (uniqueClaims.length === 0) {
      throw new BadRequestException('scope_required');
    }

    return uniqueClaims;
  }

  private readClaimsScope(value: unknown): DeKycClaimKey[] {
    return this.parseClaimsScope(value);
  }

  private isClaimKey(value: string): value is DeKycClaimKey {
    return (
      value === 'fullName' ||
      value === 'iin' ||
      value === 'birthDate' ||
      value === 'email' ||
      value === 'verified' ||
      value === 'age18Plus'
    );
  }

  private normalizeRedirectUri(value: string | undefined): string {
    const rawValue = this.normalizeRequiredString(value, 'redirect_uri');

    try {
      const url = new URL(rawValue);

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new BadRequestException('invalid_redirect_uri');
      }

      return url.toString();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('invalid_redirect_uri');
    }
  }

  private normalizeRequiredString(
    value: string | undefined,
    fieldName: string,
  ): string {
    const normalized = value?.trim();

    if (!normalized) {
      throw new BadRequestException(`${fieldName}_required`);
    }

    return normalized;
  }

  private generateAuthorizationCode(): string {
    return `code_${randomBytes(32).toString('hex')}`;
  }

  private hashAuthorizationCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  private buildCodeExpiresAt(): Date {
    return new Date(Date.now() + this.getAuthorizationCodeTtlSeconds() * 1000);
  }

  private buildConsentExpiresAt(
    expiresInSeconds: number | undefined,
  ): Date | null {
    if (!expiresInSeconds) {
      return null;
    }

    if (!Number.isFinite(expiresInSeconds) || expiresInSeconds <= 0) {
      return null;
    }

    return new Date(Date.now() + Math.floor(expiresInSeconds) * 1000);
  }

  private getAuthorizationCodeTtlSeconds(): number {
    const rawValue = process.env.DEKYC_CONNECT_AUTH_CODE_TTL_SECONDS;
    const parsed = rawValue ? Number(rawValue) : 120;

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 120;
    }

    return Math.floor(parsed);
  }

  private buildRedirectUriWithCode(input: {
    redirectUri: string;
    code: string;
    state?: string;
  }): string {
    const url = new URL(input.redirectUri);

    url.searchParams.set('code', input.code);

    if (input.state?.trim()) {
      url.searchParams.set('state', input.state.trim());
    }

    return url.toString();
  }

  private assertDevCompleteAllowed(masterSecret: string | undefined): void {
    const enabled =
      process.env.NODE_ENV !== 'production' ||
      process.env.DEKYC_CONNECT_DEV_COMPLETE_ENABLED === 'true';

    if (!enabled) {
      throw new ForbiddenException('dev_complete_disabled');
    }

    const expectedSecret = process.env.MASTER_SECRET;

    if (!expectedSecret || masterSecret !== expectedSecret) {
      throw new UnauthorizedException('invalid_master_secret');
    }
  }

  private toJsonArray(values: DeKycClaimKey[]): Prisma.InputJsonArray {
    return [...values];
  }
}