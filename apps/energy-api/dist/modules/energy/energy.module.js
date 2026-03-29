"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyModule = void 0;
const common_1 = require("@nestjs/common");
const energy_controller_1 = require("./energy.controller");
const energy_blockchain_service_1 = require("./energy-blockchain.service");
const solana_module_1 = require("../solana/solana.module");
const energy_assets_module_1 = require("../energy-assets/energy-assets.module");
let EnergyModule = class EnergyModule {
};
exports.EnergyModule = EnergyModule;
exports.EnergyModule = EnergyModule = __decorate([
    (0, common_1.Module)({
        imports: [solana_module_1.SolanaModule, energy_assets_module_1.EnergyAssetsModule],
        controllers: [energy_controller_1.EnergyController],
        providers: [energy_blockchain_service_1.EnergyBlockchainService],
        exports: [energy_blockchain_service_1.EnergyBlockchainService],
    })
], EnergyModule);
//# sourceMappingURL=energy.module.js.map