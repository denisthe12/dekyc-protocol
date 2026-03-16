import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ServicesService } from '../services/services.service';

@Injectable()
export class ServiceCredentialsGuard implements CanActivate {
  constructor(private readonly servicesService: ServicesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & {
      serviceAuth?: {
        serviceId: string;
        clientId: string;
        serviceName: string;
      };
    }>();

    const clientId = req.header('x-client-id');
    const clientSecret = req.header('x-client-secret');

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Missing service credentials');
    }

    const service = await this.servicesService.validateServiceCredentials(
      clientId,
      clientSecret,
    );

    if (!service) {
      throw new UnauthorizedException('Invalid service credentials');
    }

    req.serviceAuth = {
      serviceId: service.id,
      clientId: service.clientId,
      serviceName: service.name,
    };

    return true;
  }
}