import type { DeKycWebhookEventType } from '../types/webhook-event.type';

export class CreateWebhookEndpointDto {
  url!: string;
  eventTypes!: DeKycWebhookEventType[];
}