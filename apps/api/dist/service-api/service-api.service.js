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
let ServiceApiService = class ServiceApiService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
        if (!permission) {
            return {
                allowed: false,
                reason: 'permission_not_found',
                claims: null,
            };
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
            return {
                allowed: false,
                reason: 'permission_not_active',
                claims: null,
            };
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
            return {
                allowed: false,
                reason: 'kyc_profile_not_found',
                claims: null,
            };
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
        const scoped = (0, kyc_claims_policy_1.buildScopedClaims)({
            profile,
            allowedClaims,
            requestedClaims: input.requestedClaims,
        });
        await this.prisma.accessLog.create({
            data: {
                permissionId: permission.id,
                serviceId: permission.serviceId,
                decision: 'allowed',
                reason: 'permission_active',
            },
        });
        return {
            allowed: true,
            reason: 'permission_active',
            claims: scoped.claims,
            grantedClaims: scoped.grantedClaims,
            grantedScopes: scoped.grantedScopes,
            scopeGrantRefs: activeScopeGrants.map((row) => ({
                scope: row.scope,
                mintAddress: row.mintAddress,
                tokenAccountAddress: row.tokenAccountAddress,
                requiredAmount: row.requiredAmount,
                balanceCheckMode: row.balanceCheckMode,
            })),
            policy: {
                allowedClaims,
                requestedClaims: input.requestedClaims ?? allowedClaims,
                allowedScopes: scoped.allowedScopes,
                requestedScopes: scoped.requestedScopes,
            },
        };
    }
};
exports.ServiceApiService = ServiceApiService;
exports.ServiceApiService = ServiceApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServiceApiService);
//# sourceMappingURL=service-api.service.js.map