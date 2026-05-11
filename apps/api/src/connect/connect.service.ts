import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
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
import type {
  ConnectAuthorizationDecisionResponse,
  ConnectAuthorizationSessionDetailResponse,
  ConnectAuthorizationSessionResponse,
} from './types/connect-authorization-session-response.type';
import type { ApproveAuthorizationSessionDto } from './dto/approve-authorization-session.dto';
import type { RejectAuthorizationSessionDto } from './dto/reject-authorization-session.dto';
import { PermissionsService } from '../permissions/permissions.service';

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
    private readonly permissionsService: PermissionsService,
  ) {}

  async createAuthorizationSession(
    query: AuthorizeQueryDto,
  ): Promise<ConnectAuthorizationSessionResponse> {
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

    this.assertStateAndNoncePresent({
      state: query.state,
      nonce: query.nonce,
    });

    const claimsScope = this.parseClaimsScope(query.scope);

    this.assertRedirectUriAllowed({
      redirectUri,
      allowedRedirectUris: this.readStringArray(service.allowedRedirectUris),
    });

    this.assertScopesAllowed({
      requestedClaims: claimsScope,
      allowedScopes: this.readStringArray(service.allowedScopes),
    });

    const sessionId = this.generateAuthorizationSessionId();
    const expiresAt = this.buildAuthorizationSessionExpiresAt();

    await this.prisma.deKycConnectAuthorizationSession.create({
      data: {
        sessionId,
        serviceId: service.id,
        clientId: service.clientId,
        redirectUri,
        state: query.state?.trim() || null,
        nonce: query.nonce?.trim() || null,
        claimsScope: this.toJsonArray(claimsScope),
        status: 'pending',
        userId: null,
        consentId: null,
        codeHash: null,
        expiresAt,
        approvedAt: null,
        rejectedAt: null,
        completedAt: null,
      },
    });

    return {
      sessionId,
      status: 'pending',
      service: {
        id: service.id,
        name: service.name,
        clientId: service.clientId,
        description: service.description,
        category: service.category,
      },
      authorizationRequest: {
        responseType: 'code',
        clientId,
        redirectUri,
        scope: claimsScope,
        state: query.state ?? null,
        nonce: query.nonce ?? null,
      },
      platformConsentUrl: this.buildPlatformConsentUrl(sessionId),
      expiresAt: expiresAt.toISOString(),
    };
  }

  async getAuthorizationSessionForUser(input: {
    sessionId: string;
    userId: string;
  }): Promise<ConnectAuthorizationSessionDetailResponse> {
    const session = await this.getAuthorizationSessionOrThrow(input.sessionId);

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('authorization_session_expired');
    }

    const service = await this.servicesService.getServiceByClientIdWithSecrets(
      session.clientId,
    );

    if (!service) {
      throw new BadRequestException('service_not_found');
    }

    const permission = await this.prisma.permission.findUnique({
      where: {
        userId_serviceId: {
          userId: input.userId,
          serviceId: session.serviceId,
        },
      },
      select: {
        id: true,
        status: true,
        allowedClaims: true,
      },
    });

    return {
      sessionId: session.sessionId,
      status: session.status,
      service: {
        id: service.id,
        name: service.name,
        clientId: service.clientId,
        description: service.description,
        category: service.category,
      },
      requestedClaims: this.readClaimsScope(session.claimsScope),
      redirectUri: session.redirectUri,
      state: session.state,
      nonce: session.nonce,
      expiresAt: session.expiresAt.toISOString(),
      existingPermission: permission
        ? {
            id: permission.id,
            status: permission.status,
            allowedClaims: this.readStringArray(permission.allowedClaims),
          }
        : null,
    };
  }

  async approveAuthorizationSession(input: {
    sessionId: string;
    userId: string;
    body: ApproveAuthorizationSessionDto;
  }): Promise<ConnectAuthorizationDecisionResponse> {
    const session = await this.getAuthorizationSessionOrThrow(input.sessionId);

    if (session.status !== 'pending') {
      throw new BadRequestException('authorization_session_not_pending');
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('authorization_session_expired');
    }

    const requestedClaims = this.readClaimsScope(session.claimsScope);
    const approvedClaims = input.body.approvedClaims
      ? this.parseClaimsScope(input.body.approvedClaims)
      : requestedClaims;

    this.assertApprovedClaimsSubset({
      requestedClaims,
      approvedClaims,
    });

    const permission = await this.ensureActivePermissionForConnect({
      userId: input.userId,
      serviceId: session.serviceId,
      approvedClaims,
    });

    const service = await this.servicesService.getServiceByClientIdWithSecrets(
      session.clientId,
    );

    if (!service) {
      throw new BadRequestException('service_not_found');
    }

    const consentReceipt =
      await this.consentReceiptsService.createConsentReceipt({
        userId: input.userId,
        serviceId: session.serviceId,
        grantedClaims: approvedClaims,
        consentTextVersion:
          input.body.consentTextVersion?.trim() ||
          service.consentTextVersion ||
          'dekyc-connect-consent-v1',
        expiresAt: this.buildConsentExpiresAt(
          input.body.consentExpiresInSeconds,
        ),
      });

    const code = this.generateAuthorizationCode();
    const codeHash = this.hashAuthorizationCode(code);
    const codeExpiresAt = this.buildCodeExpiresAt();

    await this.prisma.deKycAuthorizationCode.create({
      data: {
        codeHash,
        userId: input.userId,
        serviceId: session.serviceId,
        redirectUri: session.redirectUri,
        state: session.state,
        nonce: session.nonce,
        claimsScope: this.toJsonArray(approvedClaims),
        consentId: consentReceipt.consentId,
        expiresAt: codeExpiresAt,
        consumedAt: null,
      },
    });

    await this.prisma.deKycConnectAuthorizationSession.update({
      where: {
        sessionId: session.sessionId,
      },
      data: {
        status: 'approved',
        userId: input.userId,
        consentId: consentReceipt.consentId,
        codeHash,
        approvedAt: new Date(),
        completedAt: new Date(),
      },
    });

    const redirectUriWithCode = this.buildRedirectUriWithCode({
      redirectUri: session.redirectUri,
      code,
      state: session.state ?? undefined,
    });

    return {
      sessionId: session.sessionId,
      status: 'approved',
      redirectUri: session.redirectUri,
      redirectUriWithCode,
      consentId: consentReceipt.consentId,
      serviceSubjectId: consentReceipt.serviceSubjectId,
      permission,
    };
  }

  async rejectAuthorizationSession(input: {
    sessionId: string;
    userId: string;
    body: RejectAuthorizationSessionDto;
  }): Promise<ConnectAuthorizationDecisionResponse> {
    const session = await this.getAuthorizationSessionOrThrow(input.sessionId);

    if (session.status !== 'pending') {
      throw new BadRequestException('authorization_session_not_pending');
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('authorization_session_expired');
    }

    await this.prisma.deKycConnectAuthorizationSession.update({
      where: {
        sessionId: session.sessionId,
      },
      data: {
        status: 'rejected',
        userId: input.userId,
        rejectedAt: new Date(),
        completedAt: new Date(),
      },
    });

    return {
      sessionId: session.sessionId,
      status: 'rejected',
      redirectUri: session.redirectUri,
      redirectUriWithError: this.buildRedirectUriWithError({
        redirectUri: session.redirectUri,
        error: 'access_denied',
        errorDescription: input.body.reason?.trim() || 'User rejected consent',
        state: session.state ?? undefined,
      }),
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

    this.assertRedirectUriAllowed({
      redirectUri,
      allowedRedirectUris: this.readStringArray(service.allowedRedirectUris),
    });

    this.assertScopesAllowed({
      requestedClaims: claimsScope,
      allowedScopes: this.readStringArray(service.allowedScopes),
    });
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

  private async getAuthorizationSessionOrThrow(sessionId: string) {
    const session =
      await this.prisma.deKycConnectAuthorizationSession.findUnique({
        where: {
          sessionId,
        },
      });

    if (!session) {
      throw new NotFoundException('authorization_session_not_found');
    }

    return session;
  }

  private generateAuthorizationSessionId(): string {
    return `authz_${randomBytes(18).toString('hex')}`;
  }

  private buildAuthorizationSessionExpiresAt(): Date {
    return new Date(
      Date.now() + this.getAuthorizationSessionTtlSeconds() * 1000,
    );
  }

  private getAuthorizationSessionTtlSeconds(): number {
    const rawValue = process.env.DEKYC_CONNECT_AUTH_SESSION_TTL_SECONDS;
    const parsed = rawValue ? Number(rawValue) : 600;

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 600;
    }

    return Math.floor(parsed);
  }

  private buildPlatformConsentUrl(sessionId: string): string {
    const baseUrl =
      process.env.DEKYC_PLATFORM_CONNECT_CONSENT_URL ??
      'http://localhost:3000/ru/connect/consent';

    const url = new URL(baseUrl);
    url.searchParams.set('session_id', sessionId);

    return url.toString();
  }

  private assertApprovedClaimsSubset(input: {
    requestedClaims: DeKycClaimKey[];
    approvedClaims: DeKycClaimKey[];
  }): void {
    const requested = new Set(input.requestedClaims);

    const hasOnlyRequestedClaims = input.approvedClaims.every((claim) =>
      requested.has(claim),
    );

    if (!hasOnlyRequestedClaims) {
      throw new BadRequestException('approved_claims_exceed_requested_scope');
    }
  }

  private buildRedirectUriWithError(input: {
    redirectUri: string;
    error: string;
    errorDescription: string;
    state?: string;
  }): string {
    const url = new URL(input.redirectUri);

    url.searchParams.set('error', input.error);
    url.searchParams.set('error_description', input.errorDescription);

    if (input.state?.trim()) {
      url.searchParams.set('state', input.state.trim());
    }

    return url.toString();
  }

  private readStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  private async ensureActivePermissionForConnect(input: {
    userId: string;
    serviceId: string;
    approvedClaims: DeKycClaimKey[];
  }): Promise<{
    id: string;
    status: string;
    created: boolean;
    onchainPermissionPda: string | null;
    grantTx: string | null;
  }> {
    const existingPermission = await this.prisma.permission.findUnique({
      where: {
        userId_serviceId: {
          userId: input.userId,
          serviceId: input.serviceId,
        },
      },
      select: {
        id: true,
        status: true,
        allowedClaims: true,
        onchainPermissionPda: true,
      },
    });

    if (existingPermission?.status === 'ACTIVE') {
      const existingAllowedClaims = this.readStringArray(
        existingPermission.allowedClaims,
      );

      const hasAllApprovedClaims = input.approvedClaims.every((claim) =>
        existingAllowedClaims.includes(claim),
      );

      if (!hasAllApprovedClaims) {
        throw new BadRequestException(
          'active_permission_does_not_cover_approved_claims',
        );
      }

      return {
        id: existingPermission.id,
        status: existingPermission.status,
        created: false,
        onchainPermissionPda: existingPermission.onchainPermissionPda,
        grantTx: null,
      };
    }

    const grantResult = await this.permissionsService.grantPermission(input.userId, {
      serviceId: input.serviceId,
      allowedClaims: input.approvedClaims,
    });

    return {
      id: grantResult.permission.id,
      status: grantResult.permission.status,
      created: true,
      onchainPermissionPda: grantResult.permission.onchainPermissionPda,
      grantTx: grantResult.onChain.grantTx,
    };
  }

  private assertStateAndNoncePresent(input: {
    state?: string;
    nonce?: string;
  }): void {
    if (!input.state?.trim()) {
      throw new BadRequestException('state_required');
    }

    if (!input.nonce?.trim()) {
      throw new BadRequestException('nonce_required');
    }
  }

  private assertRedirectUriAllowed(input: {
    redirectUri: string;
    allowedRedirectUris: string[];
  }): void {
    if (input.allowedRedirectUris.length === 0) {
      throw new BadRequestException('service_redirect_uris_not_configured');
    }

    const allowed = new Set(input.allowedRedirectUris);

    if (!allowed.has(input.redirectUri)) {
      throw new BadRequestException('redirect_uri_not_allowed');
    }
  }

  private assertScopesAllowed(input: {
    requestedClaims: DeKycClaimKey[];
    allowedScopes: string[];
  }): void {
    if (input.allowedScopes.length === 0) {
      throw new BadRequestException('service_allowed_scopes_not_configured');
    }

    const allowed = new Set(input.allowedScopes);

    const hasOnlyAllowedScopes = input.requestedClaims.every((claim) =>
      allowed.has(claim),
    );

    if (!hasOnlyAllowedScopes) {
      throw new BadRequestException('scope_not_allowed');
    }
  }
}