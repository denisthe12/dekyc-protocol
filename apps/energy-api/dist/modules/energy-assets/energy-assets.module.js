"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyAssetsModule = void 0;
const common_1 = require("@nestjs/common");
const energy_assets_service_1 = require("./energy-assets.service");
const public_assets_controller_1 = require("./public-assets.controller");
const private_assets_controller_1 = require("./private-assets.controller");
let EnergyAssetsModule = class EnergyAssetsModule {
};
exports.EnergyAssetsModule = EnergyAssetsModule;
exports.EnergyAssetsModule = EnergyAssetsModule = __decorate([
    (0, common_1.Module)({
        providers: [energy_assets_service_1.EnergyAssetsService],
        controllers: [public_assets_controller_1.PublicAssetsController, private_assets_controller_1.PrivateAssetsController],
        exports: [energy_assets_service_1.EnergyAssetsService],
    })
], EnergyAssetsModule);
//# sourceMappingURL=energy-assets.module.js.map