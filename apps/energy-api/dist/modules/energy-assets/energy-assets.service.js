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
exports.EnergyAssetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EnergyAssetsService = class EnergyAssetsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createDemoAsset(onchain) {
        return this.prisma.energyAsset.create({
            data: {
                assetId: onchain.assetId,
                issuerEnergyUserId: null,
                title: `Solar Roof ${onchain.assetId}`,
                description: 'Demo asset created from energy-api and Anchor program',
                location: 'Aktau, Kazakhstan',
                assetType: 'SOLAR',
                totalShares: 1000,
                pricePerShareKzte: 10000,
                investorBps: 8000,
                operatorBps: 2000,
                payoutMode: 'KZTE',
                status: 'ACTIVE_SALE',
                assetPda: onchain.assetPda,
                registryPda: onchain.registryPda,
                shareMintAddress: onchain.shareMint,
                treasuryShareAccount: onchain.treasuryShareAccount,
                proofRootHash: '0'.repeat(64),
                metadataUriHash: '0'.repeat(64),
                createAssetTx: onchain.createAssetTx,
                issueSharesTx: onchain.issueSharesTx,
            },
        });
    }
    async listAssets() {
        return this.prisma.energyAsset.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
};
exports.EnergyAssetsService = EnergyAssetsService;
exports.EnergyAssetsService = EnergyAssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnergyAssetsService);
//# sourceMappingURL=energy-assets.service.js.map