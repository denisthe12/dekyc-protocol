import type { Request } from 'express';

export interface AuthenticatedServiceRequest extends Request {
  serviceAuth: {
    serviceId: string;
    clientId: string;
    serviceName: string;
    nonce: string;
    timestamp: number;
  };
}