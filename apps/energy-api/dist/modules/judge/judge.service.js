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
exports.JudgeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const solana_service_1 = require("../solana/solana.service");
const token_2022_service_1 = require("../solana/token-2022.service");
let JudgeService = class JudgeService {
    constructor(prisma, solanaService, token2022Service) {
        this.prisma = prisma;
        this.solanaService = solanaService;
        this.token2022Service = token2022Service;
    }
    async getJudgeSummary() {
        const [solanaStatus, kzteStatus] = await Promise.all([
            this.solanaService.getSignerStatus(),
            this.token2022Service.getKzteMintStatus(),
        ]);
        const [users, assets, positions, epochs, claims] = await Promise.all([
            this.prisma.energyUser.findMany({
                include: {
                    profile: true,
                    wallet: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 10,
            }),
            this.prisma.energyAsset.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                take: 20,
            }),
            this.prisma.energyInvestorPosition.findMany({
                orderBy: {
                    updatedAt: 'desc',
                },
                take: 20,
            }),
            this.prisma.energyRevenueEpoch.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                take: 20,
            }),
            this.prisma.energyPayoutClaim.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                take: 20,
            }),
        ]);
        return {
            generatedAt: new Date().toISOString(),
            solana: {
                rpcUrl: solanaStatus.rpcUrl,
                signerAddress: solanaStatus.signerAddress,
                signerBalanceSol: solanaStatus.signerBalanceSol,
                tokenizationProgramId: this.solanaService.getProgramId().toBase58(),
            },
            kzte: kzteStatus,
            users,
            assets,
            positions,
            epochs,
            claims,
        };
    }
};
exports.JudgeService = JudgeService;
exports.JudgeService = JudgeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        solana_service_1.SolanaService,
        token_2022_service_1.Token2022Service])
], JudgeService);
//# sourceMappingURL=judge.service.js.map