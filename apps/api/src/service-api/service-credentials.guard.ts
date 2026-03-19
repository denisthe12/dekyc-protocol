import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ServicesService } from '../services/services.service';
import { ServiceRequestNonceService } from './service-request-nonce.service';

@Injectable()
export class ServiceCredentialsGuard implements CanActivate {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly nonceService: ServiceRequestNonceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & {
      serviceAuth?: {
        serviceId: string;
        clientId: string;
        serviceName: string;
        nonce: string;
        timestamp: number;
      };
    }>();

    const clientId = req.header('x-client-id');
    const clientSecret = req.header('x-client-secret');
    const timestamp = req.header('x-timestamp');
    const nonce = req.header('x-nonce');

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Missing service credentials');
    }

    if (!timestamp) {
      throw new UnauthorizedException('Missing x-timestamp');
    }

    if (!nonce) {
      throw new UnauthorizedException('Missing x-nonce');
    }

    this.assertTimestampFresh(timestamp);

    const service = await this.servicesService.validateServiceCredentials(
      clientId,
      clientSecret,
    );

    if (!service) {
      throw new UnauthorizedException('Invalid service credentials');
    }

    await this.nonceService.assertNonceUnusedAndStore(service.id, nonce);

    req.serviceAuth = {
      serviceId: service.id,
      clientId: service.clientId,
      serviceName: service.name,
      nonce,
      timestamp: Number(timestamp),
    };

    return true;
  }

  private assertTimestampFresh(timestamp: string) {
    const parsed = Number(timestamp);

    if (!Number.isFinite(parsed)) {
      throw new UnauthorizedException('Invalid x-timestamp');
    }

    const now = Date.now();
    const diff = Math.abs(now - parsed);
    const maxSkewMs = 5 * 60 * 1000;

    if (diff > maxSkewMs) {
      throw new UnauthorizedException('Request expired or timestamp skew too large');
    }
  }
}