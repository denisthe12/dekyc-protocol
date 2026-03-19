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
exports.ServiceApiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const kyc_claims_policy_1 = require("./kyc-claims-policy");
const token_2022_service_1 = require("../solana/token-2022.service");
const permission_scopes_1 = require("../permissions/permission-scopes");
const services_service_1 = require("../services/services.service");
const service_response_signature_1 = require("./service-response-signature");
let ServiceApiService = class ServiceApiService {
    prisma;
    token2022Service;
    servicesService;
    constructor(prisma, token2022Service, servicesService) {
        this.prisma = prisma;
        this.token2022Service = token2022Service;
        this.servicesService = servicesService;
    }
    async requestKyc(input) {
        const permission = await this.prisma.permission.findUnique({
            where: {
                userId_serviceId: {
                    userId: input.userId,
                    serviceId: input.serviceId,
                },
            },
            include: {
                service: true,
            },
        });
        const service = await this.servicesService.getServiceByClientIdWithSecrets(input.clientId);
        if (!service || !service.responseSigningSecret) {
            return this.buildSignedEnvelope({
                clientResponseSigningSecret: null,
                timestamp: input.timestamp,
                nonce: input.nonce,
                payload: {
                    allowed: false,
                    reason: 'service_signing_secret_not_found',
                    claims: null,
                },
            });
        }
        if (!permission) {
            return this.buildSignedEnvelope({
                clientResponseSigningSecret: service.responseSigningSecret,
                timestamp: input.timestamp,
                nonce: input.nonce,
                payload: {
                    allowed: false,
                    reason: 'permission_not_found',
                    claims: null,
                },
            });
        }
        if (permission.status !== 'ACTIVE') {
            await this.prisma.accessLog.create({
                data: {
                    permissionId: permission.id,
                    serviceId: permission.serviceId,
                    decision: 'denied',
                    reason: 'permission_not_active',
                },
            });
            return this.buildSignedEnvelope({
                clientResponseSigningSecret: service.responseSigningSecret,
                timestamp: input.timestamp,
                nonce: input.nonce,
                payload: {
                    allowed: false,
                    reason: 'permission_not_active',
                    claims: null,
                }
            });
        }
        const activeScopeGrants = await this.prisma.permissionScopeGrant.findMany({
            where: {
                permissionId: permission.id,
                revokedAt: null,
            },
            orderBy: {
                scope: 'asc',
            },
        });
        const requestedClaims = input.requestedClaims && input.requestedClaims.length > 0
            ? input.requestedClaims.map((c) => c.trim())
            : Array.isArray(permission.allowedClaims)
                ? permission.allowedClaims
                : ['fullName', 'iin', 'email'];
        const requestedScopes = requestedClaims
            .map((claim) => permission_scopes_1.CLAIM_TO_SCOPE[claim])
            .filter(Boolean);
        const tokenChecks = [];
        for (const scope of requestedScopes) {
            const grant = activeScopeGrants.find((row) => row.scope === scope);
            if (!grant) {
                tokenChecks.push({
                    scope,
                    ok: false,
                    reason: 'scope_grant_not_found',
                    readError: null,
                    tokenAccountAddress: null,
                    mintAddress: null,
                    balance: 0,
                    requiredAmount: 0,
                });
                continue;
            }
            if (!grant.tokenAccountAddress || !grant.mintAddress) {
                tokenChecks.push({
                    scope,
                    ok: false,
                    reason: 'token_refs_missing',
                    readError: null,
                    tokenAccountAddress: grant.tokenAccountAddress,
                    mintAddress: grant.mintAddress,
                    balance: 0,
                    requiredAmount: grant.requiredAmount,
                });
                continue;
            }
            let balance = 0;
            let ok = false;
            let reason = 'balance_insufficient';
            let readError = null;
            try {
                balance = await this.token2022Service.getScopeTokenBalance(grant.tokenAccountAddress);
                ok = balance >= grant.requiredAmount;
                reason = ok ? 'balance_ok' : 'balance_insufficient';
            }
            catch (error) {
                ok = false;
                reason = 'token_account_read_failed';
                readError =
                    error instanceof Error ? error.message : 'Unknown token read error';
            }
            tokenChecks.push({
                scope,
                ok,
                reason,
                readError,
                tokenAccountAddress: grant.tokenAccountAddress,
                mintAddress: grant.mintAddress,
                balance,
                requiredAmount: grant.requiredAmount,
            });
        }
        const profile = await this.prisma.kycProfile.findFirst({
            where: {
                userId: input.userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!profile) {
            await this.prisma.accessLog.create({
                data: {
                    permissionId: permission.id,
                    serviceId: permission.serviceId,
                    decision: 'denied',
                    reason: 'kyc_profile_not_found',
                },
            });
            return this.buildSignedEnvelope({
                clientResponseSigningSecret: service.responseSigningSecret,
                timestamp: input.timestamp,
                nonce: input.nonce,
                payload: {
                    allowed: false,
                    reason: 'kyc_profile_not_found',
                    claims: null,
                }
            });
        }
        const fullName = [
            profile.lastName,
            profile.firstName,
            profile.middleName,
        ]
            .filter(Boolean)
            .join(' ');
        const allowedClaims = Array.isArray(permission.allowedClaims)
            ? permission.allowedClaims
            : ['fullName', 'iin', 'email'];
        const tokenApprovedScopes = tokenChecks
            .filter((row) => row.ok)
            .map((row) => row.scope);
        const tokenApprovedClaims = allowedClaims.filter((claim) => {
            const scope = permission_scopes_1.CLAIM_TO_SCOPE[claim];
            return tokenApprovedScopes.includes(scope);
        });
        const scoped = (0, kyc_claims_policy_1.buildScopedClaims)({
            profile,
            allowedClaims: tokenApprovedClaims,
            requestedClaims,
        });
        if (scoped.grantedClaims.length === 0) {
            await this.prisma.accessLog.create({
                data: {
                    permissionId: permission.id,
                    serviceId: permission.serviceId,
                    decision: 'denied',
                    reason: 'token_balance_check_failed',
                },
            });
            return this.buildSignedEnvelope({
                clientResponseSigningSecret: service.responseSigningSecret,
                timestamp: input.timestamp,
                nonce: input.nonce,
                payload: {
                    allowed: false,
                    reason: 'token_balance_check_failed',
                    claims: null,
                    grantedClaims: [],
                    grantedScopes: [],
                    tokenChecks,
                }
            });
        }
        await this.prisma.accessLog.create({
            data: {
                permissionId: permission.id,
                serviceId: permission.serviceId,
                decision: 'allowed',
                reason: 'permission_active',
            },
        });
        return this.buildSignedEnvelope({
            clientResponseSigningSecret: service.responseSigningSecret,
            timestamp: input.timestamp,
            nonce: input.nonce,
            payload: {
                allowed: true,
                reason: 'permission_active',
                claims: scoped.claims,
                grantedClaims: scoped.grantedClaims,
                grantedScopes: scoped.grantedScopes,
                tokenChecks,
                scopeGrantRefs: activeScopeGrants.map((row) => ({
                    scope: row.scope,
                    mintAddress: row.mintAddress,
                    tokenAccountAddress: row.tokenAccountAddress,
                    requiredAmount: row.requiredAmount,
                    balanceCheckMode: row.balanceCheckMode,
                })),
                policy: {
                    allowedClaims,
                    requestedClaims,
                    allowedScopes: scoped.allowedScopes,
                    requestedScopes: scoped.requestedScopes,
                },
            },
        });
    }
    buildSignedEnvelope(input) {
        if (!input.clientResponseSigningSecret) {
            return {
                payload: input.payload,
                meta: {
                    timestamp: input.timestamp,
                    nonce: input.nonce,
                },
                signature: null,
            };
        }
        const signed = (0, service_response_signature_1.signServiceResponse)({
            responseSigningSecret: input.clientResponseSigningSecret,
            payload: input.payload,
            timestamp: input.timestamp,
            nonce: input.nonce,
        });
        return {
            payload: input.payload,
            meta: {
                timestamp: input.timestamp,
                nonce: input.nonce,
            },
            signature: signed.signature,
        };
    }
};
exports.ServiceApiService = ServiceApiService;
exports.ServiceApiService = ServiceApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        token_2022_service_1.Token2022Service,
        services_service_1.ServicesService])
], ServiceApiService);
//# sourceMappingURL=service-api.service.js.map