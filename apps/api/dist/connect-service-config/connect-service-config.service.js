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
exports.ConnectServiceConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ALLOWED_CLAIMS = [
    'fullName',
    'iin',
    'birthDate',
    'email',
    'verified',
    'age18Plus',
];
let ConnectServiceConfigService = class ConnectServiceConfigService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConfig(serviceId) {
        const service = await this.findServiceOrThrow(serviceId);
        return this.toConfigDto(service);
    }
    async updateConfig(input) {
        const existingService = await this.findServiceOrThrow(input.serviceId);
        const updatedService = await this.prisma.service.update({
            where: {
                id: existingService.id,
            },
            data: {
                allowedRedirectUris: input.dto.allowedRedirectUris !== undefined
                    ? this.normalizeRedirectUris(input.dto.allowedRedirectUris)
                    : undefined,
                allowedScopes: input.dto.allowedScopes !== undefined
                    ? this.normalizeAllowedScopes(input.dto.allowedScopes)
                    : undefined,
                assertionAudience: input.dto.assertionAudience !== undefined
                    ? this.normalizeOptionalString(input.dto.assertionAudience, 'assertion_audience')
                    : undefined,
                webhookSigningMode: input.dto.webhookSigningMode !== undefined
                    ? this.normalizeWebhookSigningMode(input.dto.webhookSigningMode)
                    : undefined,
                consentTextVersion: input.dto.consentTextVersion !== undefined
                    ? this.normalizeRequiredString(input.dto.consentTextVersion, 'consent_text_version')
                    : undefined,
                environment: input.dto.environment !== undefined
                    ? this.normalizeEnvironment(input.dto.environment)
                    : undefined,
            },
        });
        return this.toConfigDto(updatedService);
    }
    async findServiceOrThrow(serviceId) {
        const service = await this.prisma.service.findUnique({
            where: {
                id: serviceId,
            },
        });
        if (!service) {
            throw new common_1.NotFoundException('service_not_found');
        }
        return service;
    }
    normalizeRedirectUris(values) {
        if (!Array.isArray(values) || values.length === 0) {
            throw new common_1.BadRequestException('allowed_redirect_uris_required');
        }
        const normalized = values.map((value) => this.normalizeRedirectUri(value));
        return [...new Set(normalized)].sort();
    }
    normalizeRedirectUri(value) {
        const rawValue = this.normalizeRequiredString(value, 'redirect_uri');
        try {
            const url = new URL(rawValue);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                throw new common_1.BadRequestException('invalid_redirect_uri');
            }
            if (process.env.NODE_ENV === 'production' &&
                url.protocol !== 'https:') {
                throw new common_1.BadRequestException('redirect_uri_must_use_https');
            }
            return url.toString();
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('invalid_redirect_uri');
        }
    }
    normalizeAllowedScopes(values) {
        if (!Array.isArray(values) || values.length === 0) {
            throw new common_1.BadRequestException('allowed_scopes_required');
        }
        const normalized = values
            .map((value) => String(value).trim())
            .filter((value) => {
            return ALLOWED_CLAIMS.includes(value);
        });
        if (normalized.length === 0) {
            throw new common_1.BadRequestException('allowed_scopes_invalid');
        }
        return [...new Set(normalized)].sort();
    }
    normalizeWebhookSigningMode(value) {
        if (value !== 'shared_secret') {
            throw new common_1.BadRequestException('unsupported_webhook_signing_mode');
        }
        return value;
    }
    normalizeEnvironment(value) {
        if (value !== 'sandbox' &&
            value !== 'staging' &&
            value !== 'production') {
            throw new common_1.BadRequestException('invalid_environment');
        }
        return value;
    }
    normalizeRequiredString(value, fieldName) {
        const normalized = value.trim();
        if (!normalized) {
            throw new common_1.BadRequestException(`${fieldName}_required`);
        }
        return normalized;
    }
    normalizeOptionalString(value, fieldName) {
        if (value === undefined) {
            return null;
        }
        return this.normalizeRequiredString(value, fieldName);
    }
    toConfigDto(service) {
        return {
            service: {
                id: service.id,
                name: service.name,
                clientId: service.clientId,
                status: service.status,
            },
            connectConfig: {
                allowedRedirectUris: this.readStringArray(service.allowedRedirectUris),
                allowedScopes: this.readStringArray(service.allowedScopes),
                assertionAudience: service.assertionAudience,
                webhookSigningMode: service.webhookSigningMode,
                consentTextVersion: service.consentTextVersion,
                environment: service.environment,
            },
            updatedAt: service.updatedAt.toISOString(),
        };
    }
    readStringArray(value) {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.map((item) => String(item).trim()).filter(Boolean);
    }
};
exports.ConnectServiceConfigService = ConnectServiceConfigService;
exports.ConnectServiceConfigService = ConnectServiceConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConnectServiceConfigService);
//# sourceMappingURL=connect-service-config.service.js.map