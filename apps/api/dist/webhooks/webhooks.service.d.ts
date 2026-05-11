import type { DeKycWebhookEndpoint } from '../../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { WebhookSignerService } from './webhook-signer.service';
import type { CreateWebhookEndpointDto } from './dto/create-webhook-endpoint.dto';
import type { UpdateWebhookEndpointDto } from './dto/update-webhook-endpoint.dto';
export declare class WebhooksService {
    private readonly prisma;
    private readonly signer;
    constructor(prisma: PrismaService, signer: WebhookSignerService);
    createEndpoint(input: {
        serviceId: string;
        dto: CreateWebhookEndpointDto;
    }): Promise<{
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
    listEndpoints(serviceId: string): Promise<{
        id: string;
        serviceId: string;
        url: string;
        eventTypes: string[];
        status: string;
        secretHash: string;
        createdAt: string;
        updatedAt: string;
    }[]>;
    updateEndpoint(input: {
        serviceId: string;
        endpointId: string;
        dto: UpdateWebhookEndpointDto;
    }): Promise<{
        id: string;
        serviceId: string;
        url: string;
        eventTypes: string[];
        status: string;
        secretHash: string;
        createdAt: string;
        updatedAt: string;
    }>;
    findOwnedEndpointOrThrow(input: {
        serviceId: string;
        endpointId: string;
    }): Promise<DeKycWebhookEndpoint>;
    private normalizeWebhookUrl;
    private normalizeEventTypes;
    private normalizeStatus;
    private toEndpointDto;
    private readStringArray;
}
