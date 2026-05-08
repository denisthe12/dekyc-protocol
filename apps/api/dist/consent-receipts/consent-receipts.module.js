"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentReceiptsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const service_credentials_guard_1 = require("../service-api/service-credentials.guard");
const service_request_nonce_service_1 = require("../service-api/service-request-nonce.service");
const services_module_1 = require("../services/services.module");
const subjects_module_1 = require("../subjects/subjects.module");
const consent_receipts_controller_1 = require("./consent-receipts.controller");
const consent_receipts_service_1 = require("./consent-receipts.service");
const consent_receipts_signer_1 = require("./consent-receipts.signer");
let ConsentReceiptsModule = class ConsentReceiptsModule {
};
exports.ConsentReceiptsModule = ConsentReceiptsModule;
exports.ConsentReceiptsModule = ConsentReceiptsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, subjects_module_1.SubjectsModule, services_module_1.ServicesModule],
        controllers: [consent_receipts_controller_1.ConsentReceiptsController],
        providers: [
            consent_receipts_service_1.ConsentReceiptsService,
            consent_receipts_signer_1.ConsentReceiptsSigner,
            service_credentials_guard_1.ServiceCredentialsGuard,
            service_request_nonce_service_1.ServiceRequestNonceService,
        ],
        exports: [consent_receipts_service_1.ConsentReceiptsService, consent_receipts_signer_1.ConsentReceiptsSigner],
    })
], ConsentReceiptsModule);
//# sourceMappingURL=consent-receipts.module.js.map