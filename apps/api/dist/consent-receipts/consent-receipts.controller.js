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
exports.ConsentReceiptsController = void 0;
const common_1 = require("@nestjs/common");
const service_credentials_guard_1 = require("../service-api/service-credentials.guard");
const consent_receipts_service_1 = require("./consent-receipts.service");
const revoke_consent_dto_1 = require("./dto/revoke-consent.dto");
let ConsentReceiptsController = class ConsentReceiptsController {
    consentReceiptsService;
    constructor(consentReceiptsService) {
        this.consentReceiptsService = consentReceiptsService;
    }
    getConsentStatus(consentId, req) {
        return this.consentReceiptsService.getConsentStatus({
            consentId,
            serviceId: req.serviceAuth.serviceId,
        });
    }
    revokeConsent(consentId, body, req) {
        return this.consentReceiptsService.revokeConsent({
            consentId,
            serviceId: req.serviceAuth.serviceId,
            reason: body.reason,
        });
    }
    listConsentsForServiceSubject(serviceSubjectId, req) {
        return this.consentReceiptsService.listConsentsForServiceSubject({
            serviceSubjectId,
            serviceId: req.serviceAuth.serviceId,
        });
    }
};
exports.ConsentReceiptsController = ConsentReceiptsController;
__decorate([
    (0, common_1.UseGuards)(service_credentials_guard_1.ServiceCredentialsGuard),
    (0, common_1.Get)('consents/:consentId'),
    __param(0, (0, common_1.Param)('consentId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ConsentReceiptsController.prototype, "getConsentStatus", null);
__decorate([
    (0, common_1.UseGuards)(service_credentials_guard_1.ServiceCredentialsGuard),
    (0, common_1.Post)('consents/:consentId/revoke'),
    __param(0, (0, common_1.Param)('consentId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, revoke_consent_dto_1.RevokeConsentDto, Object]),
    __metadata("design:returntype", void 0)
], ConsentReceiptsController.prototype, "revokeConsent", null);
__decorate([
    (0, common_1.UseGuards)(service_credentials_guard_1.ServiceCredentialsGuard),
    (0, common_1.Get)('subjects/:serviceSubjectId/consents'),
    __param(0, (0, common_1.Param)('serviceSubjectId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ConsentReceiptsController.prototype, "listConsentsForServiceSubject", null);
exports.ConsentReceiptsController = ConsentReceiptsController = __decorate([
    (0, common_1.Controller)('connect'),
    __metadata("design:paramtypes", [consent_receipts_service_1.ConsentReceiptsService])
], ConsentReceiptsController);
//# sourceMappingURL=consent-receipts.controller.js.map