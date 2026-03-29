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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../../prisma/generated/client");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
const users_json_helper_1 = require("./users-json.helper");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const user = await this.prisma.energyUser.findUnique({
            where: { id },
        });
        if (!user) {
            return null;
        }
        return this.mapToCurrentUser(user);
    }
    async getMeView(id) {
        const user = await this.prisma.energyUser.findUnique({
            where: { id },
            include: {
                profile: true,
                wallet: true,
            },
        });
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            dekycUserId: user.dekycUserId,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            profile: user.profile
                ? {
                    iin: user.profile.iin,
                    birthDate: user.profile.birthDate,
                    verified: user.profile.verified,
                    age18Plus: user.profile.age18Plus,
                }
                : null,
            wallet: user.wallet
                ? {
                    custodialWalletAddress: user.wallet.custodialWalletAddress,
                    kzteTokenAccountAddress: user.wallet.kzteTokenAccountAddress,
                    energyPointsAccountAddress: user.wallet.energyPointsAccountAddress,
                    walletStatus: user.wallet.walletStatus,
                }
                : null,
        };
    }
    async findOrCreateFromDekycEnvelope(params) {
        const existing = await this.prisma.energyUser.findUnique({
            where: {
                dekycUserId: params.dekycUserId,
            },
            include: {
                profile: true,
                wallet: true,
            },
        });
        const fullName = typeof params.claims?.fullName === 'string'
            ? params.claims.fullName
            : null;
        const email = typeof params.claims?.email === 'string' ? params.claims.email : null;
        const iin = typeof params.claims?.iin === 'string' ? params.claims.iin : null;
        const birthDate = typeof params.claims?.birthDate === 'string'
            ? params.claims.birthDate
            : null;
        const verified = typeof params.claims?.verified === 'boolean'
            ? params.claims.verified
            : false;
        const age18Plus = typeof params.claims?.age18Plus === 'boolean'
            ? params.claims.age18Plus
            : false;
        if (existing) {
            await this.prisma.energyUser.update({
                where: { id: existing.id },
                data: {
                    email,
                    fullName,
                    lastLoginAt: new Date(),
                },
            });
            await this.prisma.energyUserProfile.upsert({
                where: {
                    energyUserId: existing.id,
                },
                update: {
                    email,
                    fullName,
                    iin,
                    birthDate,
                    verified,
                    age18Plus,
                    rawClaimsJson: (0, users_json_helper_1.toPrismaJson)(params.claims),
                },
                create: {
                    energyUserId: existing.id,
                    dekycUserId: params.dekycUserId,
                    email,
                    fullName,
                    iin,
                    birthDate,
                    verified,
                    age18Plus,
                    rawClaimsJson: (0, users_json_helper_1.toPrismaJson)(params.claims),
                },
            });
            if (!existing.wallet) {
                await this.prisma.energyUserWallet.create({
                    data: {
                        energyUserId: existing.id,
                        custodialWalletAddress: this.generateWalletAddress(),
                        walletStatus: client_1.EnergyWalletStatus.PENDING,
                    },
                });
            }
            const updated = await this.prisma.energyUser.findUniqueOrThrow({
                where: { id: existing.id },
            });
            return this.mapToCurrentUser(updated);
        }
        const created = await this.prisma.energyUser.create({
            data: {
                dekycUserId: params.dekycUserId,
                email,
                fullName,
                role: client_1.EnergyUserRole.USER,
                lastLoginAt: new Date(),
                profile: {
                    create: {
                        dekycUserId: params.dekycUserId,
                        email,
                        fullName,
                        iin,
                        birthDate,
                        verified,
                        age18Plus,
                        rawClaimsJson: (0, users_json_helper_1.toPrismaJson)(params.claims),
                    },
                },
                wallet: {
                    create: {
                        custodialWalletAddress: this.generateWalletAddress(),
                        walletStatus: client_1.EnergyWalletStatus.PENDING,
                    },
                },
            },
        });
        return this.mapToCurrentUser(created);
    }
    mapToCurrentUser(user) {
        return {
            id: user.id,
            dekycUserId: user.dekycUserId,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
        };
    }
    generateWalletAddress() {
        return `energy-wallet-${(0, crypto_1.randomUUID)()}`;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map