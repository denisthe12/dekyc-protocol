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
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const service_credentials_guard_1 = require("../service-api/service-credentials.guard");
const create_webhook_endpoint_dto_1 = require("./dto/create-webhook-endpoint.dto");
const test_webhook_dto_1 = require("./dto/test-webhook.dto");
const update_webhook_endpoint_dto_1 = require("./dto/update-webhook-endpoint.dto");
const webhook_delivery_service_1 = require("./webhook-delivery.service");
const webhooks_service_1 = require("./webhooks.service");
let WebhooksController = class WebhooksController {
    webhooksService;
    webhookDeliveryService;
    constructor(webhooksService, webhookDeliveryService) {
        this.webhooksService = webhooksService;
        this.webhookDeliveryService = webhookDeliveryService;
    }
    createWebhookEndpoint(body, req) {
        return this.webhooksService.createEndpoint({
            serviceId: req.serviceAuth.serviceId,
            dto: body,
        });
    }
    listWebhookEndpoints(req) {
        return this.webhooksService.listEndpoints(req.serviceAuth.serviceId);
    }
    updateWebhookEndpoint(endpointId, body, req) {
        return this.webhooksService.updateEndpoint({
            serviceId: req.serviceAuth.serviceId,
            endpointId,
            dto: body,
        });
    }
    testWebhookEndpoint(endpointId, body, req) {
        return this.webhookDeliveryService.sendTestEvent({
            serviceId: req.serviceAuth.serviceId,
            endpointId,
            message: body.message,
        });
    }
    listWebhookDeliveries(req) {
        return this.webhookDeliveryService.listDeliveries(req.serviceAuth.serviceId);
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.UseGuards)(service_credentials_guard_1.ServiceCredentialsGuard),
    (0, common_1.Post)('webhooks'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_webhook_endpoint_dto_1.CreateWebhookEndpointDto, Object]),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "createWebhookEndpoint", null);
__decorate([
    (0, common_1.UseGuards)(service_credentials_guard_1.ServiceCredentialsGuard),
    (0, common_1.Get)('webhooks'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "listWebhookEndpoints", null);
__decorate([
    (0, common_1.UseGuards)(service_credentials_guard_1.ServiceCredentialsGuard),
    (0, common_1.Patch)('webhooks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_webhook_endpoint_dto_1.UpdateWebhookEndpointDto, Object]),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "updateWebhookEndpoint", null);
__decorate([
    (0, common_1.UseGuards)(service_credentials_guard_1.ServiceCredentialsGuard),
    (0, common_1.Post)('webhooks/:id/test'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, test_webhook_dto_1.TestWebhookDto, Object]),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "testWebhookEndpoint", null);
__decorate([
    (0, common_1.UseGuards)(service_credentials_guard_1.ServiceCredentialsGuard),
    (0, common_1.Get)('webhook-deliveries'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "listWebhookDeliveries", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, common_1.Controller)('connect'),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService,
        webhook_delivery_service_1.WebhookDeliveryService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map