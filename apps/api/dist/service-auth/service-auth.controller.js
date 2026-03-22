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
exports.ServiceAuthController = void 0;
const common_1 = require("@nestjs/common");
const service_credentials_guard_1 = require("../service-api/service-credentials.guard");
const service_login_dto_1 = require("./dto/service-login.dto");
const service_auth_service_1 = require("./service-auth.service");
let ServiceAuthController = class ServiceAuthController {
    serviceAuthService;
    constructor(serviceAuthService) {
        this.serviceAuthService = serviceAuthService;
    }
    login(body, req) {
        return this.serviceAuthService.login({
            serviceId: req.serviceAuth.serviceId,
            clientId: req.serviceAuth.clientId,
            nonce: req.serviceAuth.nonce,
            timestamp: req.serviceAuth.timestamp,
            userId: body.userId,
            biometricMockId: body.biometricMockId,
            loginCode: body.loginCode,
            requestedClaims: body.requestedClaims,
        });
    }
};
exports.ServiceAuthController = ServiceAuthController;
__decorate([
    (0, common_1.UseGuards)(service_credentials_guard_1.ServiceCredentialsGuard),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_login_dto_1.ServiceLoginDto, Object]),
    __metadata("design:returntype", void 0)
], ServiceAuthController.prototype, "login", null);
exports.ServiceAuthController = ServiceAuthController = __decorate([
    (0, common_1.Controller)('service-auth'),
    __metadata("design:paramtypes", [service_auth_service_1.ServiceAuthService])
], ServiceAuthController);
//# sourceMappingURL=service-auth.controller.js.map