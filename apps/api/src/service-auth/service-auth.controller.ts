import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ServiceCredentialsGuard } from '../service-api/service-credentials.guard';
import { ServiceLoginDto } from './dto/service-login.dto';
import { ServiceAuthService } from './service-auth.service';

@Controller('service-auth')
export class ServiceAuthController {
  constructor(private readonly serviceAuthService: ServiceAuthService) {}

  @UseGuards(ServiceCredentialsGuard)
  @Post('login')
  login(
    @Body() body: ServiceLoginDto,
    @Req()
    req: Request & {
      serviceAuth: {
        serviceId: string;
        clientId: string;
        serviceName: string;
        nonce: string;
        timestamp: number;
      };
    },
  ) {
    return this.serviceAuthService.login({
      serviceId: req.serviceAuth.serviceId,
      clientId: req.serviceAuth.clientId,
      nonce: req.serviceAuth.nonce,
      timestamp: req.serviceAuth.timestamp,
      biometricMockId: body.biometricMockId,
      loginCode: body.loginCode,
      requestedClaims: body.requestedClaims,
    });
  }
}