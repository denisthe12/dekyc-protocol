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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicAssetsController = void 0;
const common_1 = require("@nestjs/common");
const energy_assets_service_1 = require("./energy-assets.service");
let PublicAssetsController = class PublicAssetsController {
    constructor(energyAssetsService) {
        this.energyAssetsService = energyAssetsService;
    }
    async listPublicAssets() {
        return this.energyAssetsService.listPublicAssets();
    }
    async getPublicAssetPreview(assetId) {
        return this.energyAssetsService.getPublicAssetPreview(assetId);
    }
};
exports.PublicAssetsController = PublicAssetsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicAssetsController.prototype, "listPublicAssets", null);
__decorate([
    (0, common_1.Get)(':assetId'),
    __param(0, (0, common_1.Param)('assetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicAssetsController.prototype, "getPublicAssetPreview", null);
exports.PublicAssetsController = PublicAssetsController = __decorate([
    (0, common_1.Controller)('public/assets'),
    __metadata("design:paramtypes", [energy_assets_service_1.EnergyAssetsService])
], PublicAssetsController);
//# sourceMappingURL=public-assets.controller.js.map