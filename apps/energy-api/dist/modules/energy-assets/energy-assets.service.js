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
const canonical_json_util_1 = require("../energy/utils/canonical-json.util");
let EnergyAssetsService = class EnergyAssetsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createDemoAsset(onchain) {
        return this.prisma.energyAsset.create({
            data: {
                assetId: onchain.assetId,
                issuerEnergyUserId: null,
                title: onchain.metadata.title,
                description: onchain.metadata.description,
                location: onchain.metadata.location,
                assetType: onchain.metadata.assetType,
                totalShares: onchain.metadata.totalShares,
                pricePerShareKzte: onchain.metadata.pricePerShareKzte,
                investorBps: onchain.metadata.investorBps,
                operatorBps: onchain.metadata.operatorBps,
                payoutMode: onchain.metadata.payoutMode,
                status: 'ACTIVE_SALE',
                assetPda: onchain.assetPda,
                registryPda: onchain.registryPda,
                shareMintAddress: onchain.shareMint,
                treasuryShareAccount: onchain.treasuryShareAccount,
                proofRootHash: '0'.repeat(64),
                metadataUriHash: onchain.metadataHash,
                metadataJson: onchain.metadata,
                metadataCanonicalJson: (0, canonical_json_util_1.toCanonicalJson)(onchain.metadata),
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