import type { DeKycWebhookEventType } from '../types/webhook-event.type';

export class UpdateWebhookEndpointDto {
  url?: string;
  eventTypes?: DeKycWebhookEventType[];
  status?: 'active' | 'disabled';
}