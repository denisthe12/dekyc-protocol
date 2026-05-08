"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectModule = void 0;
const common_1 = require("@nestjs/common");
const consent_receipts_module_1 = require("../consent-receipts/consent-receipts.module");
const identity_assertions_module_1 = require("../identity-assertions/identity-assertions.module");
const prisma_module_1 = require("../prisma/prisma.module");
const service_credentials_guard_1 = require("../service-api/service-credentials.guard");
const service_request_nonce_service_1 = require("../service-api/service-request-nonce.service");
const services_module_1 = require("../services/services.module");
const connect_controller_1 = require("./connect.controller");
const connect_service_1 = require("./connect.service");
let ConnectModule = class ConnectModule {
};
exports.ConnectModule = ConnectModule;
exports.ConnectModule = ConnectModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            services_module_1.ServicesModule,
            consent_receipts_module_1.ConsentReceiptsModule,
            identity_assertions_module_1.IdentityAssertionsModule,
        ],
        controllers: [connect_controller_1.ConnectController],
        providers: [connect_service_1.ConnectService, service_credentials_guard_1.ServiceCredentialsGuard, service_request_nonce_service_1.ServiceRequestNonceService],
        exports: [connect_service_1.ConnectService],
    })
], ConnectModule);
//# sourceMappingURL=connect.module.js.map