import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ServiceApiService } from './service-api.service';
import { ServiceCredentialsGuard } from './service-credentials.guard';
import { ServiceKycRequestDto } from './dto/service-kyc-request.dto';
import { Request } from 'express';

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
      };
    },
  ) {
    return this.serviceApiService.requestKyc({
      serviceId: req.serviceAuth.serviceId,
      userId: body.userId,
      requestedClaims: body.requestedClaims,
    });
  }
}