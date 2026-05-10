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
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const webhook_signer_service_1 = require("./webhook-signer.service");
const ALLOWED_EVENT_TYPES = [
    'kyc.completed',
    'consent.granted',
    'consent.revoked',
    'webhook.test',
];
let WebhooksService = class WebhooksService {
    prisma;
    signer;
    constructor(prisma, signer) {
        this.prisma = prisma;
        this.signer = signer;
    }
    async createEndpoint(input) {
        const url = this.normalizeWebhookUrl(input.dto.url);
        const eventTypes = this.normalizeEventTypes(input.dto.eventTypes);
        const endpointSeed = this.signer.createRandomEndpointIdSalt();
        const endpoint = await this.prisma.deKycWebhookEndpoint.create({
            data: {
                serviceId: input.serviceId,
                url,
                secretHash: 'pending',
                eventTypes,
                status: 'active',
            },
        });
        const signingSecret = this.signer.createSigningSecret(`${endpoint.id}:${endpointSeed}`);
        const secretHash = this.signer.hashSecret(signingSecret);
        const updatedEndpoint = await this.prisma.deKycWebhookEndpoint.update({
            where: {
                id: endpoint.id,
            },
            data: {
                secretHash,
            },
        });
        return {
            ...this.toEndpointDto(updatedEndpoint),
            signingSecret,
            signingSecretNotice: 'Store this secret now. It will not be returned again.',
        };
    }
    async listEndpoints(serviceId) {
        const endpoints = await this.prisma.deKycWebhookEndpoint.findMany({
            where: {
                serviceId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return endpoints.map((endpoint) => this.toEndpointDto(endpoint));
    }
    async updateEndpoint(input) {
        const endpoint = await this.findOwnedEndpointOrThrow({
            serviceId: input.serviceId,
            endpointId: input.endpointId,
        });
        const updatedEndpoint = await this.prisma.deKycWebhookEndpoint.update({
            where: {
                id: endpoint.id,
            },
            data: {
                url: input.dto.url !== undefined
                    ? this.normalizeWebhookUrl(input.dto.url)
                    : undefined,
                eventTypes: input.dto.eventTypes !== undefined
                    ? this.normalizeEventTypes(input.dto.eventTypes)
                    : undefined,
                status: input.dto.status !== undefined
                    ? this.normalizeStatus(input.dto.status)
                    : undefined,
            },
        });
        return this.toEndpointDto(updatedEndpoint);
    }
    async findOwnedEndpointOrThrow(input) {
        const endpoint = await this.prisma.deKycWebhookEndpoint.findUnique({
            where: {
                id: input.endpointId,
            },
        });
        if (!endpoint) {
            throw new common_1.NotFoundException('webhook_endpoint_not_found');
        }
        if (endpoint.serviceId !== input.serviceId) {
            throw new common_1.ForbiddenException('webhook_endpoint_belongs_to_another_service');
        }
        return endpoint;
    }
    normalizeWebhookUrl(value) {
        const rawValue = value?.trim();
        if (!rawValue) {
            throw new common_1.BadRequestException('webhook_url_required');
        }
        try {
            const url = new URL(rawValue);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                throw new common_1.BadRequestException('invalid_webhook_url');
            }
            if (process.env.NODE_ENV === 'production' &&
                url.protocol !== 'https:') {
                throw new common_1.BadRequestException('webhook_url_must_use_https');
            }
            return url.toString();
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('invalid_webhook_url');
        }
    }
    normalizeEventTypes(eventTypes) {
        if (!Array.isArray(eventTypes) || eventTypes.length === 0) {
            throw new common_1.BadRequestException('webhook_event_types_required');
        }
        const normalized = [...new Set(eventTypes)].filter((eventType) => {
            return ALLOWED_EVENT_TYPES.includes(eventType);
        });
        if (normalized.length === 0) {
            throw new common_1.BadRequestException('webhook_event_types_invalid');
        }
        return normalized.sort();
    }
    normalizeStatus(status) {
        if (status !== 'active' && status !== 'disabled') {
            throw new common_1.BadRequestException('invalid_webhook_status');
        }
        return status;
    }
    toEndpointDto(endpoint) {
        return {
            id: endpoint.id,
            serviceId: endpoint.serviceId,
            url: endpoint.url,
            eventTypes: this.readStringArray(endpoint.eventTypes),
            status: endpoint.status,
            secretHash: endpoint.secretHash,
            createdAt: endpoint.createdAt.toISOString(),
            updatedAt: endpoint.updatedAt.toISOString(),
        };
    }
    readStringArray(value) {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.map((item) => String(item).trim()).filter(Boolean);
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        webhook_signer_service_1.WebhookSignerService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map