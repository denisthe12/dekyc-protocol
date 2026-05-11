export type DeKycWebhookEventType =
  | 'kyc.completed'
  | 'consent.granted'
  | 'consent.revoked'
  | 'webhook.test';

export interface DeKycWebhookEventPayload {
  eventId: string;
  eventType: DeKycWebhookEventType;
  serviceId: string;
  createdAt: string;
  data: Record<string, unknown>;
}