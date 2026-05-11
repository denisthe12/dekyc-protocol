import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ServiceCredentialsGuard } from '../service-api/service-credentials.guard';
import { ConsentReceiptsService } from './consent-receipts.service';
import { RevokeConsentDto } from './dto/revoke-consent.dto';
import type { AuthenticatedServiceRequest } from './types/authenticated-service-request.type';

@Controller('connect')
export class ConsentReceiptsController {
  constructor(
    private readonly consentReceiptsService: ConsentReceiptsService,
  ) {}

  @UseGuards(ServiceCredentialsGuard)
  @Get('consents/:consentId')
  getConsentStatus(
    @Param('consentId') consentId: string,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.consentReceiptsService.getConsentStatus({
      consentId,
      serviceId: req.serviceAuth.serviceId,
    });
  }

  @UseGuards(ServiceCredentialsGuard)
  @Post('consents/:consentId/revoke')
  revokeConsent(
    @Param('consentId') consentId: string,
    @Body() body: RevokeConsentDto,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.consentReceiptsService.revokeConsent({
      consentId,
      serviceId: req.serviceAuth.serviceId,
      reason: body.reason,
    });
  }

  @UseGuards(ServiceCredentialsGuard)
  @Get('subjects/:serviceSubjectId/consents')
  listConsentsForServiceSubject(
    @Param('serviceSubjectId') serviceSubjectId: string,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.consentReceiptsService.listConsentsForServiceSubject({
      serviceSubjectId,
      serviceId: req.serviceAuth.serviceId,
    });
  }
}