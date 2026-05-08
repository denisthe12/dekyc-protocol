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
let ConnectService = class ConnectService {
    prisma;
    servicesService;
    consentReceiptsService;
    identityAssertionsService;
    constructor(prisma, servicesService, consentReceiptsService, identityAssertionsService) {
        this.prisma = prisma;
        this.servicesService = servicesService;
        this.consentReceiptsService = consentReceiptsService;
        this.identityAssertionsService = identityAssertionsService;
    }
    async previewAuthorizeRequest(query) {
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
};
exports.ConnectService = ConnectService;
exports.ConnectService = ConnectService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        services_service_1.ServicesService,
        consent_receipts_service_1.ConsentReceiptsService,
        identity_assertions_service_1.IdentityAssertionsService])
], ConnectService);
//# sourceMappingURL=connect.service.js.map