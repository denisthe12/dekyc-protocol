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
exports.DevService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../../prisma/generated/client");
const prisma_service_1 = require("../prisma/prisma.service");
const wallets_service_1 = require("../wallets/wallets.service");
let DevService = class DevService {
    constructor(prisma, walletsService) {
        this.prisma = prisma;
        this.walletsService = walletsService;
    }
    async seedDemoInvestor() {
        const existing = await this.prisma.energyUser.findUnique({
            where: {
                dekycUserId: 'demo-investor-2',
            },
            include: {
                profile: true,
                wallet: true,
            },
        });
        if (existing) {
            await this.walletsService.ensureUserWallet({
                energyUserId: existing.id,
            });
            const hydrated = await this.prisma.energyUser.findUniqueOrThrow({
                where: {
                    id: existing.id,
                },
                include: {
                    profile: true,
                    wallet: true,
                },
            });
            return {
                created: false,
                user: hydrated,
            };
        }
        const created = await this.prisma.energyUser.create({
            data: {
                dekycUserId: 'demo-investor-2',
                email: 'demo-investor-2@energy.local',
                fullName: 'Demo Investor Two',
                role: client_1.EnergyUserRole.USER,
                lastLoginAt: new Date(),
                profile: {
                    create: {
                        dekycUserId: 'demo-investor-2',
                        email: 'demo-investor-2@energy.local',
                        fullName: 'Demo Investor Two',
                        iin: '000000000002',
                        birthDate: '1995-01-01',
                        verified: true,
                        age18Plus: true,
                        rawClaimsJson: {
                            source: 'demo-seed',
                            verified: true,
                            age18Plus: true,
                        },
                    },
                },
                wallet: {
                    create: {
                        custodialWalletAddress: 'pending-demo-investor-2',
                        walletStatus: 'PENDING',
                    },
                },
            },
            include: {
                profile: true,
                wallet: true,
            },
        });
        await this.walletsService.ensureUserWallet({
            energyUserId: created.id,
        });
        const hydrated = await this.prisma.energyUser.findUniqueOrThrow({
            where: {
                id: created.id,
            },
            include: {
                profile: true,
                wallet: true,
            },
        });
        return {
            created: true,
            user: hydrated,
        };
    }
};
exports.DevService = DevService;
exports.DevService = DevService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallets_service_1.WalletsService])
], DevService);
//# sourceMappingURL=dev.service.js.map