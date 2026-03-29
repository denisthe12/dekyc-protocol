"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DekycIntegrationModule = void 0;
const common_1 = require("@nestjs/common");
const dekyc_client_service_1 = require("./dekyc-client.service");
let DekycIntegrationModule = class DekycIntegrationModule {
};
exports.DekycIntegrationModule = DekycIntegrationModule;
exports.DekycIntegrationModule = DekycIntegrationModule = __decorate([
    (0, common_1.Module)({
        providers: [dekyc_client_service_1.DekycClientService],
        exports: [dekyc_client_service_1.DekycClientService],
    })
], DekycIntegrationModule);
//# sourceMappingURL=dekyc-integration.module.js.map