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
exports.ConnectServiceConfigController = void 0;
const common_1 = require("@nestjs/common");
const service_credentials_guard_1 = require("../service-api/service-credentials.guard");
const connect_service_config_service_1 = require("./connect-service-config.service");
const update_connect_service_config_dto_1 = require("./dto/update-connect-service-config.dto");
let ConnectServiceConfigController = class ConnectServiceConfigController {
    connectServiceConfigService;
    constructor(connectServiceConfigService) {
        this.connectServiceConfigService = connectServiceConfigService;
    }
    getServiceConfig(req) {
        return this.connectServiceConfigService.getConfig(req.serviceAuth.serviceId);
    }
    updateServiceConfig(body, req) {
        return this.connectServiceConfigService.updateConfig({
            serviceId: req.serviceAuth.serviceId,
            dto: body,
        });
    }
};
exports.ConnectServiceConfigController = ConnectServiceConfigController;
__decorate([
    (0, common_1.UseGuards)(service_credentials_guard_1.ServiceCredentialsGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConnectServiceConfigController.prototype, "getServiceConfig", null);
__decorate([
    (0, common_1.UseGuards)(service_credentials_guard_1.ServiceCredentialsGuard),
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_connect_service_config_dto_1.UpdateConnectServiceConfigDto, Object]),
    __metadata("design:returntype", void 0)
], ConnectServiceConfigController.prototype, "updateServiceConfig", null);
exports.ConnectServiceConfigController = ConnectServiceConfigController = __decorate([
    (0, common_1.Controller)('connect/service-config'),
    __metadata("design:paramtypes", [connect_service_config_service_1.ConnectServiceConfigService])
], ConnectServiceConfigController);
//# sourceMappingURL=connect-service-config.controller.js.map