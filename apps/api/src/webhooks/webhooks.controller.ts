import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ServiceCredentialsGuard } from '../service-api/service-credentials.guard';
import { CreateWebhookEndpointDto } from './dto/create-webhook-endpoint.dto';
import { TestWebhookDto } from './dto/test-webhook.dto';
import { UpdateWebhookEndpointDto } from './dto/update-webhook-endpoint.dto';
import type { AuthenticatedServiceRequest } from './types/authenticated-service-request.type';
import { WebhookDeliveryService } from './webhook-delivery.service';
import { WebhooksService } from './webhooks.service';

@Controller('connect')
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly webhookDeliveryService: WebhookDeliveryService,
  ) {}

  @UseGuards(ServiceCredentialsGuard)
  @Post('webhooks')
  createWebhookEndpoint(
    @Body() body: CreateWebhookEndpointDto,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.webhooksService.createEndpoint({
      serviceId: req.serviceAuth.serviceId,
      dto: body,
    });
  }

  @UseGuards(ServiceCredentialsGuard)
  @Get('webhooks')
  listWebhookEndpoints(@Req() req: AuthenticatedServiceRequest) {
    return this.webhooksService.listEndpoints(req.serviceAuth.serviceId);
  }

  @UseGuards(ServiceCredentialsGuard)
  @Patch('webhooks/:id')
  updateWebhookEndpoint(
    @Param('id') endpointId: string,
    @Body() body: UpdateWebhookEndpointDto,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.webhooksService.updateEndpoint({
      serviceId: req.serviceAuth.serviceId,
      endpointId,
      dto: body,
    });
  }

  @UseGuards(ServiceCredentialsGuard)
  @Post('webhooks/:id/test')
  testWebhookEndpoint(
    @Param('id') endpointId: string,
    @Body() body: TestWebhookDto,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.webhookDeliveryService.sendTestEvent({
      serviceId: req.serviceAuth.serviceId,
      endpointId,
      message: body.message,
    });
  }

  @UseGuards(ServiceCredentialsGuard)
  @Get('webhook-deliveries')
  listWebhookDeliveries(@Req() req: AuthenticatedServiceRequest) {
    return this.webhookDeliveryService.listDeliveries(
      req.serviceAuth.serviceId,
    );
  }
}