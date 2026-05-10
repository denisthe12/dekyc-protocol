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
exports.WebhookDeliveryService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const webhook_signer_service_1 = require("./webhook-signer.service");
let WebhookDeliveryService = class WebhookDeliveryService {
    prisma;
    signer;
    constructor(prisma, signer) {
        this.prisma = prisma;
        this.signer = signer;
    }
    async emitEvent(input) {
        const endpoints = await this.prisma.deKycWebhookEndpoint.findMany({
            where: {
                serviceId: input.serviceId,
                status: 'active',
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        const targetEndpoints = endpoints.filter((endpoint) => {
            return this.readStringArray(endpoint.eventTypes).includes(input.eventType);
        });
        await Promise.all(targetEndpoints.map((endpoint) => this.deliverToEndpoint({
            endpointId: endpoint.id,
            url: endpoint.url,
            serviceId: input.serviceId,
            eventType: input.eventType,
            data: input.data,
        })));
    }
    async emitConsentGranted(input) {
        await this.emitEvent({
            serviceId: input.serviceId,
            eventType: 'consent.granted',
            data: {
                consentId: input.consentId,
                subjectId: input.subjectId,
                serviceSubjectId: input.serviceSubjectId,
                grantedClaims: input.grantedClaims,
                grantedAt: input.grantedAt,
                expiresAt: input.expiresAt,
                receiptHash: input.receiptHash,
            },
        });
    }
    async emitConsentRevoked(input) {
        await this.emitEvent({
            serviceId: input.serviceId,
            eventType: 'consent.revoked',
            data: {
                consentId: input.consentId,
                subjectId: input.subjectId,
                serviceSubjectId: input.serviceSubjectId,
                revokedAt: input.revokedAt,
            },
        });
    }
    async sendTestEvent(input) {
        const endpoint = await this.prisma.deKycWebhookEndpoint.findUnique({
            where: {
                id: input.endpointId,
            },
        });
        if (!endpoint || endpoint.serviceId !== input.serviceId) {
            throw new Error('webhook_endpoint_not_found');
        }
        return this.deliverToEndpoint({
            endpointId: endpoint.id,
            url: endpoint.url,
            serviceId: input.serviceId,
            eventType: 'webhook.test',
            data: {
                endpointId: endpoint.id,
                message: input.message ?? 'DeKYC webhook test event',
            },
        });
    }
    async listDeliveries(serviceId) {
        const endpoints = await this.prisma.deKycWebhookEndpoint.findMany({
            where: {
                serviceId,
            },
            select: {
                id: true,
            },
        });
        const endpointIds = endpoints.map((endpoint) => endpoint.id);
        if (endpointIds.length === 0) {
            return [];
        }
        const deliveries = await this.prisma.deKycWebhookDelivery.findMany({
            where: {
                endpointId: {
                    in: endpointIds,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50,
        });
        return deliveries.map((delivery) => ({
            id: delivery.id,
            endpointId: delivery.endpointId,
            eventId: delivery.eventId,
            eventType: delivery.eventType,
            payloadJson: delivery.payloadJson,
            signature: delivery.signature,
            status: delivery.status,
            attempts: delivery.attempts,
            lastError: delivery.lastError,
            createdAt: delivery.createdAt.toISOString(),
            deliveredAt: delivery.deliveredAt?.toISOString() ?? null,
        }));
    }
    async deliverToEndpoint(input) {
        const eventId = `evt_${(0, crypto_1.randomUUID)().replaceAll('-', '')}`;
        const timestamp = Date.now();
        const payload = {
            eventId,
            eventType: input.eventType,
            serviceId: input.serviceId,
            createdAt: new Date(timestamp).toISOString(),
            data: input.data,
        };
        const signingSecret = this.signer.createSigningSecret(input.endpointId);
        const signature = this.signer.signPayload({
            signingSecret,
            timestamp,
            payload,
        });
        const delivery = await this.prisma.deKycWebhookDelivery.create({
            data: {
                endpointId: input.endpointId,
                eventId,
                eventType: input.eventType,
                payloadJson: this.toInputJson(payload),
                signature,
                status: 'pending',
                attempts: 0,
                lastError: null,
                deliveredAt: null,
            },
        });
        try {
            const response = await fetch(input.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-dekyc-event-id': eventId,
                    'x-dekyc-event-type': input.eventType,
                    'x-dekyc-timestamp': String(timestamp),
                    'x-dekyc-signature': signature,
                },
                body: JSON.stringify(payload),
            });
            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${responseText}`);
            }
            const updatedDelivery = await this.prisma.deKycWebhookDelivery.update({
                where: {
                    id: delivery.id,
                },
                data: {
                    status: 'delivered',
                    attempts: {
                        increment: 1,
                    },
                    lastError: null,
                    deliveredAt: new Date(),
                },
            });
            return {
                id: updatedDelivery.id,
                eventId: updatedDelivery.eventId,
                eventType: updatedDelivery.eventType,
                status: updatedDelivery.status,
                attempts: updatedDelivery.attempts,
            };
        }
        catch (error) {
            const updatedDelivery = await this.prisma.deKycWebhookDelivery.update({
                where: {
                    id: delivery.id,
                },
                data: {
                    status: 'failed',
                    attempts: {
                        increment: 1,
                    },
                    lastError: error instanceof Error ? error.message : 'Unknown webhook error',
                },
            });
            return {
                id: updatedDelivery.id,
                eventId: updatedDelivery.eventId,
                eventType: updatedDelivery.eventType,
                status: updatedDelivery.status,
                attempts: updatedDelivery.attempts,
                lastError: updatedDelivery.lastError,
            };
        }
    }
    readStringArray(value) {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.map((item) => String(item).trim()).filter(Boolean);
    }
    toInputJson(value) {
        const serialized = JSON.stringify(value);
        if (typeof serialized !== 'string') {
            throw new Error('Webhook payload is not JSON serializable');
        }
        return JSON.parse(serialized);
    }
};
exports.WebhookDeliveryService = WebhookDeliveryService;
exports.WebhookDeliveryService = WebhookDeliveryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        webhook_signer_service_1.WebhookSignerService])
], WebhookDeliveryService);
//# sourceMappingURL=webhook-delivery.service.js.map