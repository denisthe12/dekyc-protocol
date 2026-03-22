"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceAuthModule = void 0;
const common_1 = require("@nestjs/common");
const service_auth_controller_1 = require("./service-auth.controller");
const service_auth_service_1 = require("./service-auth.service");
const service_api_module_1 = require("../service-api/service-api.module");
const services_module_1 = require("../services/services.module");
const service_credentials_guard_1 = require("../service-api/service-credentials.guard");
const service_request_nonce_service_1 = require("../service-api/service-request-nonce.service");
let ServiceAuthModule = class ServiceAuthModule {
};
exports.ServiceAuthModule = ServiceAuthModule;
exports.ServiceAuthModule = ServiceAuthModule = __decorate([
    (0, common_1.Module)({
        imports: [service_api_module_1.ServiceApiModule, services_module_1.ServicesModule],
        controllers: [service_auth_controller_1.ServiceAuthController],
        providers: [
            service_auth_service_1.ServiceAuthService,
            service_credentials_guard_1.ServiceCredentialsGuard,
            service_request_nonce_service_1.ServiceRequestNonceService,
        ],
    })
], ServiceAuthModule);
//# sourceMappingURL=service-auth.module.js.map