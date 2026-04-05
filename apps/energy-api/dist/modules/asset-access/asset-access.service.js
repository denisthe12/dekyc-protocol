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
exports.AssetAccessService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AssetAccessService = class AssetAccessService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAccess(params) {
        const asset = await this.prisma.energyAsset.findUnique({
            where: { assetId: params.assetId },
        });
        if (!asset) {
            throw new common_1.NotFoundException('Asset not found');
        }
        const access = await this.prisma.energyAssetAccess.findUnique({
            where: {
                energyUserId_energyAssetId: {
                    energyUserId: params.energyUserId,
                    energyAssetId: asset.id,
                },
            },
        });
        return {
            assetId: asset.assetId,
            energyUserId: params.energyUserId,
            hasAccess: access?.status === 'GRANTED',
            status: access?.status ?? null,
        };
    }
    async requestAccess(params) {
        const asset = await this.prisma.energyAsset.findUnique({
            where: { assetId: params.assetId },
        });
        if (!asset) {
            throw new common_1.NotFoundException('Asset not found');
        }
        const access = await this.prisma.energyAssetAccess.upsert({
            where: {
                energyUserId_energyAssetId: {
                    energyUserId: params.energyUserId,
                    energyAssetId: asset.id,
                },
            },
            update: {
                status: 'GRANTED',
                grantedAt: new Date(),
            },
            create: {
                energyUserId: params.energyUserId,
                energyAssetId: asset.id,
                status: 'GRANTED',
                grantedAt: new Date(),
            },
        });
        return {
            assetId: asset.assetId,
            energyUserId: params.energyUserId,
            hasAccess: true,
            status: access.status,
        };
    }
};
exports.AssetAccessService = AssetAccessService;
exports.AssetAccessService = AssetAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssetAccessService);
//# sourceMappingURL=asset-access.service.js.map