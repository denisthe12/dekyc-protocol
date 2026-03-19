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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceCredentialsGuard = void 0;
const common_1 = require("@nestjs/common");
const services_service_1 = require("../services/services.service");
const service_request_nonce_service_1 = require("./service-request-nonce.service");
let ServiceCredentialsGuard = class ServiceCredentialsGuard {
    servicesService;
    nonceService;
    constructor(servicesService, nonceService) {
        this.servicesService = servicesService;
        this.nonceService = nonceService;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const clientId = req.header('x-client-id');
        const clientSecret = req.header('x-client-secret');
        const timestamp = req.header('x-timestamp');
        const nonce = req.header('x-nonce');
        if (!clientId || !clientSecret) {
            throw new common_1.UnauthorizedException('Missing service credentials');
        }
        if (!timestamp) {
            throw new common_1.UnauthorizedException('Missing x-timestamp');
        }
        if (!nonce) {
            throw new common_1.UnauthorizedException('Missing x-nonce');
        }
        this.assertTimestampFresh(timestamp);
        const service = await this.servicesService.validateServiceCredentials(clientId, clientSecret);
        if (!service) {
            throw new common_1.UnauthorizedException('Invalid service credentials');
        }
        await this.nonceService.assertNonceUnusedAndStore(service.id, nonce);
        req.serviceAuth = {
            serviceId: service.id,
            clientId: service.clientId,
            serviceName: service.name,
            nonce,
            timestamp: Number(timestamp),
        };
        return true;
    }
    assertTimestampFresh(timestamp) {
        const parsed = Number(timestamp);
        if (!Number.isFinite(parsed)) {
            throw new common_1.UnauthorizedException('Invalid x-timestamp');
        }
        const now = Date.now();
        const diff = Math.abs(now - parsed);
        const maxSkewMs = 5 * 60 * 1000;
        if (diff > maxSkewMs) {
            throw new common_1.UnauthorizedException('Request expired or timestamp skew too large');
        }
    }
};
exports.ServiceCredentialsGuard = ServiceCredentialsGuard;
exports.ServiceCredentialsGuard = ServiceCredentialsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [services_service_1.ServicesService,
        service_request_nonce_service_1.ServiceRequestNonceService])
], ServiceCredentialsGuard);
//# sourceMappingURL=service-credentials.guard.js.map