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
exports.PrivateAssetsController = void 0;
const common_1 = require("@nestjs/common");
const energy_assets_service_1 = require("./energy-assets.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let PrivateAssetsController = class PrivateAssetsController {
    constructor(energyAssetsService) {
        this.energyAssetsService = energyAssetsService;
    }
    async getPrivateAssetDetail(assetId) {
        return this.energyAssetsService.getPrivateAssetDetail(assetId);
    }
};
exports.PrivateAssetsController = PrivateAssetsController;
__decorate([
    (0, common_1.Get)(':assetId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('assetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrivateAssetsController.prototype, "getPrivateAssetDetail", null);
exports.PrivateAssetsController = PrivateAssetsController = __decorate([
    (0, common_1.Controller)('assets'),
    __metadata("design:paramtypes", [energy_assets_service_1.EnergyAssetsService])
], PrivateAssetsController);
//# sourceMappingURL=private-assets.controller.js.map