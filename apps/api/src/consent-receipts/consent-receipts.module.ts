import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ServiceCredentialsGuard } from '../service-api/service-credentials.guard';
import { ServiceRequestNonceService } from '../service-api/service-request-nonce.service';
import { ServicesModule } from '../services/services.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { ConsentReceiptsController } from './consent-receipts.controller';
import { ConsentReceiptsService } from './consent-receipts.service';
import { ConsentReceiptsSigner } from './consent-receipts.signer';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [PrismaModule, SubjectsModule, ServicesModule, WebhooksModule],
  controllers: [ConsentReceiptsController],
  providers: [
    ConsentReceiptsService,
    ConsentReceiptsSigner,
    ServiceCredentialsGuard,
    ServiceRequestNonceService,
  ],
  exports: [ConsentReceiptsService, ConsentReceiptsSigner],
})
export class ConsentReceiptsModule {}