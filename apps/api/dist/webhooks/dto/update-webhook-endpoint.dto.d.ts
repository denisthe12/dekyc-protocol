import type { DeKycWebhookEventType } from '../types/webhook-event.type';
export declare class UpdateWebhookEndpointDto {
    url?: string;
    eventTypes?: DeKycWebhookEventType[];
    status?: 'active' | 'disabled';
}
