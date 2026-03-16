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
let ServiceCredentialsGuard = class ServiceCredentialsGuard {
    servicesService;
    constructor(servicesService) {
        this.servicesService = servicesService;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const clientId = req.header('x-client-id');
        const clientSecret = req.header('x-client-secret');
        if (!clientId || !clientSecret) {
            throw new common_1.UnauthorizedException('Missing service credentials');
        }
        const service = await this.servicesService.validateServiceCredentials(clientId, clientSecret);
        if (!service) {
            throw new common_1.UnauthorizedException('Invalid service credentials');
        }
        req.serviceAuth = {
            serviceId: service.id,
            clientId: service.clientId,
            serviceName: service.name,
        };
        return true;
    }
};
exports.ServiceCredentialsGuard = ServiceCredentialsGuard;
exports.ServiceCredentialsGuard = ServiceCredentialsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [services_service_1.ServicesService])
], ServiceCredentialsGuard);
//# sourceMappingURL=service-credentials.guard.js.map