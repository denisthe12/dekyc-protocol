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
exports.EnergyController = void 0;
const common_1 = require("@nestjs/common");
const energy_blockchain_service_1 = require("./energy-blockchain.service");
const energy_assets_service_1 = require("../energy-assets/energy-assets.service");
const buy_demo_shares_dto_1 = require("./dto/buy-demo-shares.dto");
let EnergyController = class EnergyController {
    constructor(energyBlockchainService, energyAssetsService) {
        this.energyBlockchainService = energyBlockchainService;
        this.energyAssetsService = energyAssetsService;
    }
    async createRegistry() {
        return this.energyBlockchainService.createRegistryIfNeeded();
    }
    async createAsset() {
        return this.energyBlockchainService.createEnergyAsset();
    }
    async createDemoAsset() {
        const onchain = await this.energyBlockchainService.createEnergyAsset();
        const db = await this.energyAssetsService.createDemoAsset(onchain);
        return {
            onchain,
            db,
        };
    }
    async buyDemoShares(dto) {
        return this.energyBlockchainService.buyDemoShares(dto);
    }
    async listAssets() {
        return this.energyAssetsService.listAssets();
    }
};
exports.EnergyController = EnergyController;
__decorate([
    (0, common_1.Post)('create-registry'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EnergyController.prototype, "createRegistry", null);
__decorate([
    (0, common_1.Post)('create-asset'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EnergyController.prototype, "createAsset", null);
__decorate([
    (0, common_1.Post)('create-demo-asset'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EnergyController.prototype, "createDemoAsset", null);
__decorate([
    (0, common_1.Post)('buy-demo-shares'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [buy_demo_shares_dto_1.BuyDemoSharesDto]),
    __metadata("design:returntype", Promise)
], EnergyController.prototype, "buyDemoShares", null);
__decorate([
    (0, common_1.Get)('assets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EnergyController.prototype, "listAssets", null);
exports.EnergyController = EnergyController = __decorate([
    (0, common_1.Controller)('energy'),
    __metadata("design:paramtypes", [energy_blockchain_service_1.EnergyBlockchainService,
        energy_assets_service_1.EnergyAssetsService])
], EnergyController);
//# sourceMappingURL=energy.controller.js.map