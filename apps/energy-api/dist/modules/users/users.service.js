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
const wallets_service_1 = require("../wallets/wallets.service");
const users_json_helper_1 = require("./users-json.helper");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const solana_service_1 = require("../solana/solana.service");
const energy_points_service_1 = require("../solana/energy-points.service");
let UsersService = class UsersService {
    constructor(prisma, walletsService, solanaService, energyPointsService) {
        this.prisma = prisma;
        this.walletsService = walletsService;
        this.solanaService = solanaService;
        this.energyPointsService = energyPointsService;
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
                dekycConnectLogins: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
        });
        if (!user) {
            return null;
        }
        const latestDekycConnectLogin = user.dekycConnectLogins[0] ?? null;
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
                    initialKzteAirdropped: user.wallet.initialKzteAirdropped,
                    initialKzteAirdropTx: user.wallet.initialKzteAirdropTx,
                }
                : null,
            latestDekycConnectLogin: latestDekycConnectLogin
                ? {
                    id: latestDekycConnectLogin.id,
                    assertionId: latestDekycConnectLogin.assertionId,
                    consentId: latestDekycConnectLogin.consentId,
                    serviceSubjectId: latestDekycConnectLogin.serviceSubjectId,
                    consentReceiptHash: latestDekycConnectLogin.consentReceiptHash,
                    assertionExpiresAt: latestDekycConnectLogin.assertionExpiresAt.toISOString(),
                    createdAt: latestDekycConnectLogin.createdAt.toISOString(),
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
        let userId;
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
            userId = existing.id;
        }
        else {
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
                            custodialWalletAddress: `pending-${params.dekycUserId}`,
                            walletStatus: client_1.EnergyWalletStatus.PENDING,
                        },
                    },
                },
            });
            userId = created.id;
        }
        await this.walletsService.ensureUserWallet({
            energyUserId: userId,
        });
        const user = await this.prisma.energyUser.findUniqueOrThrow({
            where: { id: userId },
        });
        return this.mapToCurrentUser(user);
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
    async getProfile(energyUserId) {
        const user = await this.prisma.energyUser.findUniqueOrThrow({
            where: {
                id: energyUserId,
            },
            include: {
                profile: true,
            },
        });
        const wallet = await this.prisma.energyUserWallet.findUnique({
            where: {
                energyUserId,
            },
        });
        const actionPassword = await this.prisma.energyUserActionPassword.findUnique({
            where: {
                energyUserId,
            },
            select: {
                id: true,
            },
        });
        const connection = this.solanaService.getConnection();
        let kzteAmountBaseUnits = '0';
        let energyPointsAmountBaseUnits = '0';
        if (wallet?.kzteTokenAccountAddress) {
            try {
                const account = await (0, spl_token_1.getAccount)(connection, new web3_js_1.PublicKey(wallet.kzteTokenAccountAddress), undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
                kzteAmountBaseUnits = account.amount.toString();
            }
            catch {
                kzteAmountBaseUnits = '0';
            }
        }
        if (wallet?.energyPointsTokenAccountAddress) {
            try {
                const account = await (0, spl_token_1.getAccount)(connection, new web3_js_1.PublicKey(wallet.energyPointsTokenAccountAddress), undefined, spl_token_1.TOKEN_2022_PROGRAM_ID);
                energyPointsAmountBaseUnits = account.amount.toString();
            }
            catch {
                energyPointsAmountBaseUnits = '0';
            }
        }
        const energyPointsStatus = await this.energyPointsService.getEnergyPointsMintStatus();
        return {
            user: {
                id: user.id,
                dekycUserId: user.dekycUserId,
                fullName: user.fullName,
                email: user.email,
                iin: user.profile?.iin,
                createdAt: user.createdAt.toISOString(),
            },
            wallet: wallet
                ? {
                    custodialWalletAddress: wallet.custodialWalletAddress,
                    kzteTokenAccountAddress: wallet.kzteTokenAccountAddress,
                    energyPointsTokenAccountAddress: wallet.energyPointsTokenAccountAddress,
                }
                : null,
            balances: {
                kzte: {
                    amountBaseUnits: kzteAmountBaseUnits,
                    decimals: 2,
                },
                energyPoints: {
                    amountBaseUnits: energyPointsAmountBaseUnits,
                    decimals: energyPointsStatus.decimals ?? 2,
                },
            },
            security: {
                actionPasswordIsSet: Boolean(actionPassword),
            },
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallets_service_1.WalletsService,
        solana_service_1.SolanaService,
        energy_points_service_1.EnergyPointsService])
], UsersService);
//# sourceMappingURL=users.service.js.map