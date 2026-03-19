export type AuthenticatedServiceRequest = {
  serviceId: string;
  clientId: string;
  serviceName: string;
  nonce: string;
  timestamp: number;
};