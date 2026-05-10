import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ServiceCredentialsGuard } from '../service-api/service-credentials.guard';
import { ConnectServiceConfigService } from './connect-service-config.service';
import { UpdateConnectServiceConfigDto } from './dto/update-connect-service-config.dto';
import type { AuthenticatedServiceRequest } from './types/authenticated-service-request.type';

@Controller('connect/service-config')
export class ConnectServiceConfigController {
  constructor(
    private readonly connectServiceConfigService: ConnectServiceConfigService,
  ) {}

  @UseGuards(ServiceCredentialsGuard)
  @Get()
  getServiceConfig(@Req() req: AuthenticatedServiceRequest) {
    return this.connectServiceConfigService.getConfig(
      req.serviceAuth.serviceId,
    );
  }

  @UseGuards(ServiceCredentialsGuard)
  @Patch()
  updateServiceConfig(
    @Body() body: UpdateConnectServiceConfigDto,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.connectServiceConfigService.updateConfig({
      serviceId: req.serviceAuth.serviceId,
      dto: body,
    });
  }
}