"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceApiModule = void 0;
const common_1 = require("@nestjs/common");
const service_api_controller_1 = require("./service-api.controller");
const service_api_service_1 = require("./service-api.service");
const service_credentials_guard_1 = require("./service-credentials.guard");
const services_module_1 = require("../services/services.module");
const service_request_nonce_service_1 = require("./service-request-nonce.service");
let ServiceApiModule = class ServiceApiModule {
};
exports.ServiceApiModule = ServiceApiModule;
exports.ServiceApiModule = ServiceApiModule = __decorate([
    (0, common_1.Module)({
        imports: [services_module_1.ServicesModule],
        controllers: [service_api_controller_1.ServiceApiController],
        providers: [
            service_api_service_1.ServiceApiService,
            service_credentials_guard_1.ServiceCredentialsGuard,
            service_request_nonce_service_1.ServiceRequestNonceService,
        ],
    })
], ServiceApiModule);
//# sourceMappingURL=service-api.module.js.map