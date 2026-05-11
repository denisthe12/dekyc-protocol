import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ServiceCredentialsGuard } from '../service-api/service-credentials.guard';
import { ServiceRequestNonceService } from '../service-api/service-request-nonce.service';
import { ServicesModule } from '../services/services.module';
import { WebhookDeliveryService } from './webhook-delivery.service';
import { WebhookSignerService } from './webhook-signer.service';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [PrismaModule, ServicesModule],
  controllers: [WebhooksController],
  providers: [
    WebhooksService,
    WebhookDeliveryService,
    WebhookSignerService,
    ServiceCredentialsGuard,
    ServiceRequestNonceService,
  ],
  exports: [WebhooksService, WebhookDeliveryService, WebhookSignerService],
})
export class WebhooksModule {}