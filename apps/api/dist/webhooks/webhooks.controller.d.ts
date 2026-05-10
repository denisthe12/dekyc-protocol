import { CreateWebhookEndpointDto } from './dto/create-webhook-endpoint.dto';
import { TestWebhookDto } from './dto/test-webhook.dto';
import { UpdateWebhookEndpointDto } from './dto/update-webhook-endpoint.dto';
import type { AuthenticatedServiceRequest } from './types/authenticated-service-request.type';
import { WebhookDeliveryService } from './webhook-delivery.service';
import { WebhooksService } from './webhooks.service';
export declare class WebhooksController {
    private readonly webhooksService;
    private readonly webhookDeliveryService;
    constructor(webhooksService: WebhooksService, webhookDeliveryService: WebhookDeliveryService);
    createWebhookEndpoint(body: CreateWebhookEndpointDto, req: AuthenticatedServiceRequest): Promise<{
        signingSecret: string;
        signingSecretNotice: string;
        id: string;
        serviceId: string;
        url: string;
        eventTypes: string[];
        status: string;
        secretHash: string;
        createdAt: string;
        updatedAt: string;
    }>;
    listWebhookEndpoints(req: AuthenticatedServiceRequest): Promise<{
        id: string;
        serviceId: string;
        url: string;
        eventTypes: string[];
        status: string;
        secretHash: string;
        createdAt: string;
        updatedAt: string;
    }[]>;
    updateWebhookEndpoint(endpointId: string, body: UpdateWebhookEndpointDto, req: AuthenticatedServiceRequest): Promise<{
        id: string;
        serviceId: string;
        url: string;
        eventTypes: string[];
        status: string;
        secretHash: string;
        createdAt: string;
        updatedAt: string;
    }>;
    testWebhookEndpoint(endpointId: string, body: TestWebhookDto, req: AuthenticatedServiceRequest): Promise<{
        id: string;
        eventId: string;
        eventType: string;
        status: string;
        attempts: number;
        lastError?: undefined;
    } | {
        id: string;
        eventId: string;
        eventType: string;
        status: string;
        attempts: number;
        lastError: string | null;
    }>;
    listWebhookDeliveries(req: AuthenticatedServiceRequest): Promise<{
        id: string;
        endpointId: string;
        eventId: string;
        eventType: string;
        payloadJson: import("../../prisma/generated/client/runtime/library").JsonValue;
        signature: string;
        status: string;
        attempts: number;
        lastError: string | null;
        createdAt: string;
        deliveredAt: string | null;
    }[]>;
}
