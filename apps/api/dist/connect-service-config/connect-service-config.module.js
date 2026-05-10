"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectServiceConfigModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const service_credentials_guard_1 = require("../service-api/service-credentials.guard");
const service_request_nonce_service_1 = require("../service-api/service-request-nonce.service");
const services_module_1 = require("../services/services.module");
const connect_service_config_controller_1 = require("./connect-service-config.controller");
const connect_service_config_service_1 = require("./connect-service-config.service");
let ConnectServiceConfigModule = class ConnectServiceConfigModule {
};
exports.ConnectServiceConfigModule = ConnectServiceConfigModule;
exports.ConnectServiceConfigModule = ConnectServiceConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, services_module_1.ServicesModule],
        controllers: [connect_service_config_controller_1.ConnectServiceConfigController],
        providers: [
            connect_service_config_service_1.ConnectServiceConfigService,
            service_credentials_guard_1.ServiceCredentialsGuard,
            service_request_nonce_service_1.ServiceRequestNonceService,
        ],
        exports: [connect_service_config_service_1.ConnectServiceConfigService],
    })
], ConnectServiceConfigModule);
//# sourceMappingURL=connect-service-config.module.js.map