import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { DeKycWebhookEndpoint } from '../../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { WebhookSignerService } from './webhook-signer.service';
import type { CreateWebhookEndpointDto } from './dto/create-webhook-endpoint.dto';
import type { UpdateWebhookEndpointDto } from './dto/update-webhook-endpoint.dto';
import type { DeKycWebhookEventType } from './types/webhook-event.type';

const ALLOWED_EVENT_TYPES: DeKycWebhookEventType[] = [
  'kyc.completed',
  'consent.granted',
  'consent.revoked',
  'webhook.test',
];

@Injectable()
export class WebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly signer: WebhookSignerService,
  ) {}

  async createEndpoint(input: {
    serviceId: string;
    dto: CreateWebhookEndpointDto;
  }) {
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

    const signingSecret = this.signer.createSigningSecret(
      `${endpoint.id}:${endpointSeed}`,
    );

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
      signingSecretNotice:
        'Store this secret now. It will not be returned again.',
    };
  }

  async listEndpoints(serviceId: string) {
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

  async updateEndpoint(input: {
    serviceId: string;
    endpointId: string;
    dto: UpdateWebhookEndpointDto;
  }) {
    const endpoint = await this.findOwnedEndpointOrThrow({
      serviceId: input.serviceId,
      endpointId: input.endpointId,
    });

    const updatedEndpoint = await this.prisma.deKycWebhookEndpoint.update({
      where: {
        id: endpoint.id,
      },
      data: {
        url:
          input.dto.url !== undefined
            ? this.normalizeWebhookUrl(input.dto.url)
            : undefined,
        eventTypes:
          input.dto.eventTypes !== undefined
            ? this.normalizeEventTypes(input.dto.eventTypes)
            : undefined,
        status:
          input.dto.status !== undefined
            ? this.normalizeStatus(input.dto.status)
            : undefined,
      },
    });

    return this.toEndpointDto(updatedEndpoint);
  }

  async findOwnedEndpointOrThrow(input: {
    serviceId: string;
    endpointId: string;
  }): Promise<DeKycWebhookEndpoint> {
    const endpoint = await this.prisma.deKycWebhookEndpoint.findUnique({
      where: {
        id: input.endpointId,
      },
    });

    if (!endpoint) {
      throw new NotFoundException('webhook_endpoint_not_found');
    }

    if (endpoint.serviceId !== input.serviceId) {
      throw new ForbiddenException('webhook_endpoint_belongs_to_another_service');
    }

    return endpoint;
  }

  private normalizeWebhookUrl(value: string): string {
    const rawValue = value?.trim();

    if (!rawValue) {
      throw new BadRequestException('webhook_url_required');
    }

    try {
      const url = new URL(rawValue);

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new BadRequestException('invalid_webhook_url');
      }

      if (
        process.env.NODE_ENV === 'production' &&
        url.protocol !== 'https:'
      ) {
        throw new BadRequestException('webhook_url_must_use_https');
      }

      return url.toString();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('invalid_webhook_url');
    }
  }

  private normalizeEventTypes(
    eventTypes: DeKycWebhookEventType[] | undefined,
  ): DeKycWebhookEventType[] {
    if (!Array.isArray(eventTypes) || eventTypes.length === 0) {
      throw new BadRequestException('webhook_event_types_required');
    }

    const normalized = [...new Set(eventTypes)].filter(
      (eventType): eventType is DeKycWebhookEventType => {
        return ALLOWED_EVENT_TYPES.includes(eventType);
      },
    );

    if (normalized.length === 0) {
      throw new BadRequestException('webhook_event_types_invalid');
    }

    return normalized.sort();
  }

  private normalizeStatus(status: string): string {
    if (status !== 'active' && status !== 'disabled') {
      throw new BadRequestException('invalid_webhook_status');
    }

    return status;
  }

  private toEndpointDto(endpoint: DeKycWebhookEndpoint) {
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

  private readStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => String(item).trim()).filter(Boolean);
  }
}