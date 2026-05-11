import { Module } from '@nestjs/common';
import { ConsentReceiptsModule } from '../consent-receipts/consent-receipts.module';
import { IdentityAssertionsModule } from '../identity-assertions/identity-assertions.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ServiceCredentialsGuard } from '../service-api/service-credentials.guard';
import { ServiceRequestNonceService } from '../service-api/service-request-nonce.service';
import { ServicesModule } from '../services/services.module';
import { ConnectController } from './connect.controller';
import { ConnectService } from './connect.service';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    PrismaModule,
    ServicesModule,
    ConsentReceiptsModule,
    IdentityAssertionsModule,
    PermissionsModule,
  ],
  controllers: [ConnectController],
  providers: [ConnectService, ServiceCredentialsGuard, ServiceRequestNonceService],
  exports: [ConnectService],
})
export class ConnectModule {}