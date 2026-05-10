import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Prisma } from '../../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { WebhookSignerService } from './webhook-signer.service';
import type {
  DeKycWebhookEventPayload,
  DeKycWebhookEventType,
} from './types/webhook-event.type';

@Injectable()
export class WebhookDeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly signer: WebhookSignerService,
  ) {}

  async emitEvent(input: {
    serviceId: string;
    eventType: DeKycWebhookEventType;
    data: Record<string, unknown>;
  }): Promise<void> {
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

    await Promise.all(
      targetEndpoints.map((endpoint) =>
        this.deliverToEndpoint({
          endpointId: endpoint.id,
          url: endpoint.url,
          serviceId: input.serviceId,
          eventType: input.eventType,
          data: input.data,
        }),
      ),
    );
  }

  async emitConsentGranted(input: {
    serviceId: string;
    consentId: string;
    subjectId: string;
    serviceSubjectId: string;
    grantedClaims: string[];
    grantedAt: string;
    expiresAt: string | null;
    receiptHash: string;
  }): Promise<void> {
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

  async emitConsentRevoked(input: {
    serviceId: string;
    consentId: string;
    subjectId: string;
    serviceSubjectId: string;
    revokedAt: string;
  }): Promise<void> {
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

  async sendTestEvent(input: {
    serviceId: string;
    endpointId: string;
    message?: string;
  }) {
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

  async listDeliveries(serviceId: string) {
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

  private async deliverToEndpoint(input: {
    endpointId: string;
    url: string;
    serviceId: string;
    eventType: DeKycWebhookEventType;
    data: Record<string, unknown>;
  }) {
    const eventId = `evt_${randomUUID().replaceAll('-', '')}`;
    const timestamp = Date.now();

    const payload: DeKycWebhookEventPayload = {
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
    } catch (error) {
      const updatedDelivery = await this.prisma.deKycWebhookDelivery.update({
        where: {
          id: delivery.id,
        },
        data: {
          status: 'failed',
          attempts: {
            increment: 1,
          },
          lastError:
            error instanceof Error ? error.message : 'Unknown webhook error',
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

  private readStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  private toInputJson(value: unknown): Prisma.InputJsonValue {
    const serialized = JSON.stringify(value);

    if (typeof serialized !== 'string') {
      throw new Error('Webhook payload is not JSON serializable');
    }

    return JSON.parse(serialized) as Prisma.InputJsonValue;
  }
}