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
exports.PermissionScopeGrantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PermissionScopeGrantsService = class PermissionScopeGrantsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async replaceScopeGrants(input) {
        const uniqueScopes = [...new Set(input.scopes)].sort();
        const existing = await this.prisma.permissionScopeGrant.findMany({
            where: {
                permissionId: input.permissionId,
            },
        });
        for (const row of existing) {
            if (!uniqueScopes.includes(row.scope)) {
                await this.prisma.permissionScopeGrant.update({
                    where: { id: row.id },
                    data: {
                        revokedAt: new Date(),
                    },
                });
            }
        }
        const results = [];
        for (const scope of uniqueScopes) {
            const found = existing.find((row) => row.scope === scope);
            if (found) {
                const updated = await this.prisma.permissionScopeGrant.update({
                    where: { id: found.id },
                    data: {
                        requiredAmount: input.requiredAmount,
                        tokenProgram: input.tokenProgram,
                        revokedAt: null,
                    },
                });
                results.push(updated);
            }
            else {
                const created = await this.prisma.permissionScopeGrant.create({
                    data: {
                        permissionId: input.permissionId,
                        serviceId: input.serviceId,
                        scope,
                        requiredAmount: input.requiredAmount,
                        tokenProgram: input.tokenProgram,
                        balanceCheckMode: 'gte',
                    },
                });
                results.push(created);
            }
        }
        return results;
    }
    async attachTokenRefs(input) {
        return this.prisma.permissionScopeGrant.update({
            where: {
                permissionId_scope: {
                    permissionId: input.permissionId,
                    scope: input.scope,
                },
            },
            data: {
                mintAddress: input.mintAddress,
                tokenAccountAddress: input.tokenAccountAddress,
                tokenProgram: input.tokenProgram,
            },
        });
    }
    async getActiveScopeGrants(permissionId) {
        return this.prisma.permissionScopeGrant.findMany({
            where: {
                permissionId,
                revokedAt: null,
            },
            orderBy: {
                scope: 'asc',
            },
        });
    }
};
exports.PermissionScopeGrantsService = PermissionScopeGrantsService;
exports.PermissionScopeGrantsService = PermissionScopeGrantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionScopeGrantsService);
//# sourceMappingURL=permission-scope-grants.service.js.map