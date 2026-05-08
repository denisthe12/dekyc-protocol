import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ServiceCredentialsGuard } from '../service-api/service-credentials.guard';
import { ConnectService } from './connect.service';
import { AuthorizeQueryDto } from './dto/authorize-query.dto';
import { CompleteAuthorizationDto } from './dto/complete-authorization.dto';
import { TokenRequestDto } from './dto/token-request.dto';
import type { AuthenticatedServiceRequest } from './types/authenticated-service-request.type';
import type { CompleteAuthorizationResult } from './types/complete-authorization-result.type';

@Controller('connect')
export class ConnectController {
  constructor(private readonly connectService: ConnectService) {}

  @Get('authorize')
  authorize(@Query() query: AuthorizeQueryDto) {
    return this.connectService.previewAuthorizeRequest(query);
  }

  @Post('dev/authorize/complete')
  completeAuthorizationForDev(
    @Body() body: CompleteAuthorizationDto,
    @Headers('x-master-secret') masterSecret: string | undefined,
  ): Promise<CompleteAuthorizationResult> {
    return this.connectService.completeAuthorizationForDev(body, masterSecret);
  }

  @UseGuards(ServiceCredentialsGuard)
  @Post('token')
  exchangeToken(
    @Body() body: TokenRequestDto,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.connectService.exchangeAuthorizationCode({
      body,
      serviceAuth: {
        serviceId: req.serviceAuth.serviceId,
        clientId: req.serviceAuth.clientId,
      },
    });
  }
}