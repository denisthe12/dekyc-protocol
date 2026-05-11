import type { DeKycWebhookEventType } from '../types/webhook-event.type';
export declare class CreateWebhookEndpointDto {
    url: string;
    eventTypes: DeKycWebhookEventType[];
}
