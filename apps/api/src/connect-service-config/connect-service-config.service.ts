import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { DeKycClaimKey } from '@energy/shared';
import type { Service } from '../../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateConnectServiceConfigDto } from './dto/update-connect-service-config.dto';

const ALLOWED_CLAIMS: DeKycClaimKey[] = [
  'fullName',
  'iin',
  'birthDate',
  'email',
  'verified',
  'age18Plus',
];

@Injectable()
export class ConnectServiceConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig(serviceId: string) {
    const service = await this.findServiceOrThrow(serviceId);

    return this.toConfigDto(service);
  }

  async updateConfig(input: {
    serviceId: string;
    dto: UpdateConnectServiceConfigDto;
  }) {
    const existingService = await this.findServiceOrThrow(input.serviceId);

    const updatedService = await this.prisma.service.update({
      where: {
        id: existingService.id,
      },
      data: {
        allowedRedirectUris:
          input.dto.allowedRedirectUris !== undefined
            ? this.normalizeRedirectUris(input.dto.allowedRedirectUris)
            : undefined,
        allowedScopes:
          input.dto.allowedScopes !== undefined
            ? this.normalizeAllowedScopes(input.dto.allowedScopes)
            : undefined,
        assertionAudience:
          input.dto.assertionAudience !== undefined
            ? this.normalizeOptionalString(
                input.dto.assertionAudience,
                'assertion_audience',
              )
            : undefined,
        webhookSigningMode:
          input.dto.webhookSigningMode !== undefined
            ? this.normalizeWebhookSigningMode(input.dto.webhookSigningMode)
            : undefined,
        consentTextVersion:
          input.dto.consentTextVersion !== undefined
            ? this.normalizeRequiredString(
                input.dto.consentTextVersion,
                'consent_text_version',
              )
            : undefined,
        environment:
          input.dto.environment !== undefined
            ? this.normalizeEnvironment(input.dto.environment)
            : undefined,
      },
    });

    return this.toConfigDto(updatedService);
  }

  private async findServiceOrThrow(serviceId: string): Promise<Service> {
    const service = await this.prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service) {
      throw new NotFoundException('service_not_found');
    }

    return service;
  }

  private normalizeRedirectUris(values: string[]): string[] {
    if (!Array.isArray(values) || values.length === 0) {
      throw new BadRequestException('allowed_redirect_uris_required');
    }

    const normalized = values.map((value) => this.normalizeRedirectUri(value));
    return [...new Set(normalized)].sort();
  }

  private normalizeRedirectUri(value: string): string {
    const rawValue = this.normalizeRequiredString(value, 'redirect_uri');

    try {
      const url = new URL(rawValue);

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new BadRequestException('invalid_redirect_uri');
      }

      if (
        process.env.NODE_ENV === 'production' &&
        url.protocol !== 'https:'
      ) {
        throw new BadRequestException('redirect_uri_must_use_https');
      }

      return url.toString();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('invalid_redirect_uri');
    }
  }

  private normalizeAllowedScopes(values: DeKycClaimKey[]): DeKycClaimKey[] {
    if (!Array.isArray(values) || values.length === 0) {
      throw new BadRequestException('allowed_scopes_required');
    }

    const normalized = values
      .map((value) => String(value).trim())
      .filter((value): value is DeKycClaimKey => {
        return ALLOWED_CLAIMS.includes(value as DeKycClaimKey);
      });

    if (normalized.length === 0) {
      throw new BadRequestException('allowed_scopes_invalid');
    }

    return [...new Set(normalized)].sort();
  }

  private normalizeWebhookSigningMode(value: string): string {
    if (value !== 'shared_secret') {
      throw new BadRequestException('unsupported_webhook_signing_mode');
    }

    return value;
  }

  private normalizeEnvironment(value: string): string {
    if (
      value !== 'sandbox' &&
      value !== 'staging' &&
      value !== 'production'
    ) {
      throw new BadRequestException('invalid_environment');
    }

    return value;
  }

  private normalizeRequiredString(value: string, fieldName: string): string {
    const normalized = value.trim();

    if (!normalized) {
      throw new BadRequestException(`${fieldName}_required`);
    }

    return normalized;
  }

  private normalizeOptionalString(
    value: string | undefined,
    fieldName: string,
  ): string | null {
    if (value === undefined) {
      return null;
    }

    return this.normalizeRequiredString(value, fieldName);
  }

  private toConfigDto(service: Service) {
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

  private readStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => String(item).trim()).filter(Boolean);
  }
}