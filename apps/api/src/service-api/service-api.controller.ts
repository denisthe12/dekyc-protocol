import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ServiceApiService } from './service-api.service';
import { ServiceCredentialsGuard } from './service-credentials.guard';
import { ServiceKycRequestDto } from './dto/service-kyc-request.dto';
import { Request } from 'express';
import type { TokenCheck } from './service-api.service';

@Controller('service-api')
export class ServiceApiController {
  constructor(private readonly serviceApiService: ServiceApiService) {}

  @UseGuards(ServiceCredentialsGuard)
  @Post('kyc-request')
  requestKyc(
    @Body() body: ServiceKycRequestDto,
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
    return this.serviceApiService.requestKyc({
      serviceId: req.serviceAuth.serviceId,
      clientId: req.serviceAuth.clientId,
      nonce: req.serviceAuth.nonce,
      timestamp: req.serviceAuth.timestamp,
      userId: body.userId,
      requestedClaims: body.requestedClaims,
    });
  }
}