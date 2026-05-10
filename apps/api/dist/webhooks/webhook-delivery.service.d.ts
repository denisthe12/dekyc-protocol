import type { Prisma } from '../../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { WebhookSignerService } from './webhook-signer.service';
import type { DeKycWebhookEventType } from './types/webhook-event.type';
export declare class WebhookDeliveryService {
    private readonly prisma;
    private readonly signer;
    constructor(prisma: PrismaService, signer: WebhookSignerService);
    emitEvent(input: {
        serviceId: string;
        eventType: DeKycWebhookEventType;
        data: Record<string, unknown>;
    }): Promise<void>;
    emitConsentGranted(input: {
        serviceId: string;
        consentId: string;
        subjectId: string;
        serviceSubjectId: string;
        grantedClaims: string[];
        grantedAt: string;
        expiresAt: string | null;
        receiptHash: string;
    }): Promise<void>;
    emitConsentRevoked(input: {
        serviceId: string;
        consentId: string;
        subjectId: string;
        serviceSubjectId: string;
        revokedAt: string;
    }): Promise<void>;
    sendTestEvent(input: {
        serviceId: string;
        endpointId: string;
        message?: string;
    }): Promise<{
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
    listDeliveries(serviceId: string): Promise<{
        id: string;
        endpointId: string;
        eventId: string;
        eventType: string;
        payloadJson: Prisma.JsonValue;
        signature: string;
        status: string;
        attempts: number;
        lastError: string | null;
        createdAt: string;
        deliveredAt: string | null;
    }[]>;
    private deliverToEndpoint;
    private readStringArray;
    private toInputJson;
}
