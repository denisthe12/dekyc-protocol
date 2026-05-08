export type DeKycWebhookEventType =
  | 'kyc.completed'
  | 'consent.granted'
  | 'consent.revoked'
  | 'profile.updated'
  | 'assurance.changed';

export type DeKycWebhookEndpointStatus =
  | 'active'
  | 'disabled';

export type DeKycWebhookDeliveryStatus =
  | 'pending'
  | 'delivered'
  | 'failed';

export interface DeKycWebhookEndpointDto {
  id: string;
  serviceId: string;
  url: string;
  eventTypes: DeKycWebhookEventType[];
  status: DeKycWebhookEndpointStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DeKycWebhookEventDto<TPayload extends object = Record<string, unknown>> {
  eventId: string;
  eventType: DeKycWebhookEventType;
  serviceId: string;
  occurredAt: string;
  payload: TPayload;
}

export interface DeKycWebhookDeliveryDto {
  id: string;
  endpointId: string;
  eventId: string;
  eventType: DeKycWebhookEventType;
  status: DeKycWebhookDeliveryStatus;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  deliveredAt: string | null;
}