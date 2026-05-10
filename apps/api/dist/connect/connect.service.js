"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const consent_receipts_service_1 = require("../consent-receipts/consent-receipts.service");
const identity_assertions_service_1 = require("../identity-assertions/identity-assertions.service");
const prisma_service_1 = require("../prisma/prisma.service");
const services_service_1 = require("../services/services.service");
const permissions_service_1 = require("../permissions/permissions.service");
let ConnectService = class ConnectService {
    prisma;
    servicesService;
    consentReceiptsService;
    identityAssertionsService;
    permissionsService;
    constructor(prisma, servicesService, consentReceiptsService, identityAssertionsService, permissionsService) {
        this.prisma = prisma;
        this.servicesService = servicesService;
        this.consentReceiptsService = consentReceiptsService;
        this.identityAssertionsService = identityAssertionsService;
        this.permissionsService = permissionsService;
    }
    async createAuthorizationSession(query) {
        const clientId = this.getClientIdFromAuthorizeQuery(query);
        const redirectUri = this.normalizeRedirectUri(query.redirect_uri ?? query.redirectUri);
        const responseType = query.response_type ?? query.responseType ?? 'code';
        if (responseType !== 'code') {
            throw new common_1.BadRequestException('unsupported_response_type');
        }
        const service = await this.servicesService.getServiceByClientIdWithSecrets(clientId);
        if (!service || service.status !== 'active') {
            throw new common_1.UnauthorizedException('invalid_client');
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
    async getAuthorizationSessionForUser(input) {
        const session = await this.getAuthorizationSessionOrThrow(input.sessionId);
        if (session.expiresAt.getTime() <= Date.now()) {
            throw new common_1.BadRequestException('authorization_session_expired');
        }
        const service = await this.servicesService.getServiceByClientIdWithSecrets(session.clientId);
        if (!service) {
            throw new common_1.BadRequestException('service_not_found');
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
    async approveAuthorizationSession(input) {
        const session = await this.getAuthorizationSessionOrThrow(input.sessionId);
        if (session.status !== 'pending') {
            throw new common_1.BadRequestException('authorization_session_not_pending');
        }
        if (session.expiresAt.getTime() <= Date.now()) {
            throw new common_1.BadRequestException('authorization_session_expired');
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
        const service = await this.servicesService.getServiceByClientIdWithSecrets(session.clientId);
        if (!service) {
            throw new common_1.BadRequestException('service_not_found');
        }
        const consentReceipt = await this.consentReceiptsService.createConsentReceipt({
            userId: input.userId,
            serviceId: session.serviceId,
            grantedClaims: approvedClaims,
            consentTextVersion: input.body.consentTextVersion?.trim() ||
                service.consentTextVersion ||
                'dekyc-connect-consent-v1',
            expiresAt: this.buildConsentExpiresAt(input.body.consentExpiresInSeconds),
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
    async rejectAuthorizationSession(input) {
        const session = await this.getAuthorizationSessionOrThrow(input.sessionId);
        if (session.status !== 'pending') {
            throw new common_1.BadRequestException('authorization_session_not_pending');
        }
        if (session.expiresAt.getTime() <= Date.now()) {
            throw new common_1.BadRequestException('authorization_session_expired');
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
    async completeAuthorizationForDev(input, masterSecret) {
        this.assertDevCompleteAllowed(masterSecret);
        const clientId = this.normalizeRequiredString(input.clientId, 'clientId');
        const redirectUri = this.normalizeRedirectUri(input.redirectUri);
        const service = await this.servicesService.getServiceByClientIdWithSecrets(clientId);
        if (!service || service.status !== 'active') {
            throw new common_1.UnauthorizedException('invalid_client');
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
        const consentReceipt = await this.consentReceiptsService.createConsentReceipt({
            userId,
            serviceId: service.id,
            grantedClaims: claimsScope,
            consentTextVersion: input.consentTextVersion?.trim() || 'dekyc-connect-consent-v1',
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
    async exchangeAuthorizationCode(input) {
        const grantType = input.body.grant_type ?? input.body.grantType;
        if (grantType !== 'authorization_code') {
            throw new common_1.BadRequestException('unsupported_grant_type');
        }
        const bodyClientId = input.body.client_id ?? input.body.clientId;
        if (bodyClientId && bodyClientId !== input.serviceAuth.clientId) {
            throw new common_1.UnauthorizedException('client_id_mismatch');
        }
        const code = this.normalizeRequiredString(input.body.code, 'code');
        const redirectUri = this.normalizeRedirectUri(input.body.redirect_uri ?? input.body.redirectUri);
        const codeHash = this.hashAuthorizationCode(code);
        const authorizationCode = await this.prisma.deKycAuthorizationCode.findUnique({
            where: {
                codeHash,
            },
        });
        if (!authorizationCode) {
            throw new common_1.BadRequestException('code_not_found');
        }
        if (authorizationCode.serviceId !== input.serviceAuth.serviceId) {
            throw new common_1.ForbiddenException('code_belongs_to_another_service');
        }
        if (authorizationCode.redirectUri !== redirectUri) {
            throw new common_1.BadRequestException('invalid_redirect_uri');
        }
        if (authorizationCode.consumedAt) {
            throw new common_1.BadRequestException('code_consumed');
        }
        if (authorizationCode.expiresAt.getTime() <= Date.now()) {
            throw new common_1.BadRequestException('code_expired');
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
            throw new common_1.BadRequestException('code_consumed');
        }
        const claimsScope = this.readClaimsScope(authorizationCode.claimsScope);
        const identityAssertion = await this.identityAssertionsService.createIdentityAssertion({
            userId: authorizationCode.userId,
            serviceId: authorizationCode.serviceId,
            consentId: authorizationCode.consentId,
            claimsScope,
        });
        const consentReceipt = await this.consentReceiptsService.getConsentReceipt({
            consentId: authorizationCode.consentId,
            serviceId: authorizationCode.serviceId,
        });
        return {
            tokenType: 'dekyc_identity_assertion',
            expiresIn: Math.max(0, identityAssertion.payload.exp - Math.floor(Date.now() / 1000)),
            identityAssertion,
            consentReceipt,
            minimalClaims: await this.buildMinimalClaims({
                userId: authorizationCode.userId,
                claimsScope,
            }),
        };
    }
    getClientIdFromAuthorizeQuery(query) {
        return this.normalizeRequiredString(query.client_id ?? query.clientId, 'client_id');
    }
    async resolveUserIdForDev(input) {
        if (input.userId?.trim()) {
            return input.userId.trim();
        }
        if (!input.userEmail?.trim()) {
            throw new common_1.BadRequestException('userId_or_userEmail_required');
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
            throw new common_1.BadRequestException('user_not_found');
        }
        return user.id;
    }
    async buildMinimalClaims(input) {
        const profile = await this.prisma.kycProfile.findFirst({
            where: {
                userId: input.userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        const claims = {};
        if (!profile) {
            if (input.claimsScope.includes('verified')) {
                claims.verified = false;
            }
            return claims;
        }
        const fullName = profile.fullName ||
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
    calculateAge18Plus(birthDate) {
        const parsedBirthDate = new Date(birthDate);
        if (Number.isNaN(parsedBirthDate.getTime())) {
            return null;
        }
        const now = new Date();
        const eighteenYearsAgo = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
        return parsedBirthDate <= eighteenYearsAgo;
    }
    parseClaimsScope(value) {
        const rawClaims = Array.isArray(value)
            ? value
            : typeof value === 'string'
                ? value.split(/[,\s]+/)
                : [];
        const claims = rawClaims
            .map((item) => String(item).trim())
            .filter((item) => this.isClaimKey(item));
        const uniqueClaims = [...new Set(claims)].sort();
        if (uniqueClaims.length === 0) {
            throw new common_1.BadRequestException('scope_required');
        }
        return uniqueClaims;
    }
    readClaimsScope(value) {
        return this.parseClaimsScope(value);
    }
    isClaimKey(value) {
        return (value === 'fullName' ||
            value === 'iin' ||
            value === 'birthDate' ||
            value === 'email' ||
            value === 'verified' ||
            value === 'age18Plus');
    }
    normalizeRedirectUri(value) {
        const rawValue = this.normalizeRequiredString(value, 'redirect_uri');
        try {
            const url = new URL(rawValue);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                throw new common_1.BadRequestException('invalid_redirect_uri');
            }
            return url.toString();
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('invalid_redirect_uri');
        }
    }
    normalizeRequiredString(value, fieldName) {
        const normalized = value?.trim();
        if (!normalized) {
            throw new common_1.BadRequestException(`${fieldName}_required`);
        }
        return normalized;
    }
    generateAuthorizationCode() {
        return `code_${(0, crypto_1.randomBytes)(32).toString('hex')}`;
    }
    hashAuthorizationCode(code) {
        return (0, crypto_1.createHash)('sha256').update(code).digest('hex');
    }
    buildCodeExpiresAt() {
        return new Date(Date.now() + this.getAuthorizationCodeTtlSeconds() * 1000);
    }
    buildConsentExpiresAt(expiresInSeconds) {
        if (!expiresInSeconds) {
            return null;
        }
        if (!Number.isFinite(expiresInSeconds) || expiresInSeconds <= 0) {
            return null;
        }
        return new Date(Date.now() + Math.floor(expiresInSeconds) * 1000);
    }
    getAuthorizationCodeTtlSeconds() {
        const rawValue = process.env.DEKYC_CONNECT_AUTH_CODE_TTL_SECONDS;
        const parsed = rawValue ? Number(rawValue) : 120;
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return 120;
        }
        return Math.floor(parsed);
    }
    buildRedirectUriWithCode(input) {
        const url = new URL(input.redirectUri);
        url.searchParams.set('code', input.code);
        if (input.state?.trim()) {
            url.searchParams.set('state', input.state.trim());
        }
        return url.toString();
    }
    assertDevCompleteAllowed(masterSecret) {
        const enabled = process.env.NODE_ENV !== 'production' ||
            process.env.DEKYC_CONNECT_DEV_COMPLETE_ENABLED === 'true';
        if (!enabled) {
            throw new common_1.ForbiddenException('dev_complete_disabled');
        }
        const expectedSecret = process.env.MASTER_SECRET;
        if (!expectedSecret || masterSecret !== expectedSecret) {
            throw new common_1.UnauthorizedException('invalid_master_secret');
        }
    }
    toJsonArray(values) {
        return [...values];
    }
    async getAuthorizationSessionOrThrow(sessionId) {
        const session = await this.prisma.deKycConnectAuthorizationSession.findUnique({
            where: {
                sessionId,
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('authorization_session_not_found');
        }
        return session;
    }
    generateAuthorizationSessionId() {
        return `authz_${(0, crypto_1.randomBytes)(18).toString('hex')}`;
    }
    buildAuthorizationSessionExpiresAt() {
        return new Date(Date.now() + this.getAuthorizationSessionTtlSeconds() * 1000);
    }
    getAuthorizationSessionTtlSeconds() {
        const rawValue = process.env.DEKYC_CONNECT_AUTH_SESSION_TTL_SECONDS;
        const parsed = rawValue ? Number(rawValue) : 600;
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return 600;
        }
        return Math.floor(parsed);
    }
    buildPlatformConsentUrl(sessionId) {
        const baseUrl = process.env.DEKYC_PLATFORM_CONNECT_CONSENT_URL ??
            'http://localhost:3000/ru/connect/consent';
        const url = new URL(baseUrl);
        url.searchParams.set('session_id', sessionId);
        return url.toString();
    }
    assertApprovedClaimsSubset(input) {
        const requested = new Set(input.requestedClaims);
        const hasOnlyRequestedClaims = input.approvedClaims.every((claim) => requested.has(claim));
        if (!hasOnlyRequestedClaims) {
            throw new common_1.BadRequestException('approved_claims_exceed_requested_scope');
        }
    }
    buildRedirectUriWithError(input) {
        const url = new URL(input.redirectUri);
        url.searchParams.set('error', input.error);
        url.searchParams.set('error_description', input.errorDescription);
        if (input.state?.trim()) {
            url.searchParams.set('state', input.state.trim());
        }
        return url.toString();
    }
    readStringArray(value) {
        if (!Array.isArray(value)) {
            return [];
        }
        return value
            .map((item) => String(item).trim())
            .filter(Boolean);
    }
    async ensureActivePermissionForConnect(input) {
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
            const existingAllowedClaims = this.readStringArray(existingPermission.allowedClaims);
            const hasAllApprovedClaims = input.approvedClaims.every((claim) => existingAllowedClaims.includes(claim));
            if (!hasAllApprovedClaims) {
                throw new common_1.BadRequestException('active_permission_does_not_cover_approved_claims');
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
    assertStateAndNoncePresent(input) {
        if (!input.state?.trim()) {
            throw new common_1.BadRequestException('state_required');
        }
        if (!input.nonce?.trim()) {
            throw new common_1.BadRequestException('nonce_required');
        }
    }
    assertRedirectUriAllowed(input) {
        if (input.allowedRedirectUris.length === 0) {
            throw new common_1.BadRequestException('service_redirect_uris_not_configured');
        }
        const allowed = new Set(input.allowedRedirectUris);
        if (!allowed.has(input.redirectUri)) {
            throw new common_1.BadRequestException('redirect_uri_not_allowed');
        }
    }
    assertScopesAllowed(input) {
        if (input.allowedScopes.length === 0) {
            throw new common_1.BadRequestException('service_allowed_scopes_not_configured');
        }
        const allowed = new Set(input.allowedScopes);
        const hasOnlyAllowedScopes = input.requestedClaims.every((claim) => allowed.has(claim));
        if (!hasOnlyAllowedScopes) {
            throw new common_1.BadRequestException('scope_not_allowed');
        }
    }
};
exports.ConnectService = ConnectService;
exports.ConnectService = ConnectService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        services_service_1.ServicesService,
        consent_receipts_service_1.ConsentReceiptsService,
        identity_assertions_service_1.IdentityAssertionsService,
        permissions_service_1.PermissionsService])
], ConnectService);
//# sourceMappingURL=connect.service.js.map