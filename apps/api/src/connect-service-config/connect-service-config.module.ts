import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ServiceCredentialsGuard } from '../service-api/service-credentials.guard';
import { ServiceRequestNonceService } from '../service-api/service-request-nonce.service';
import { ServicesModule } from '../services/services.module';
import { ConnectServiceConfigController } from './connect-service-config.controller';
import { ConnectServiceConfigService } from './connect-service-config.service';

@Module({
  imports: [PrismaModule, ServicesModule],
  controllers: [ConnectServiceConfigController],
  providers: [
    ConnectServiceConfigService,
    ServiceCredentialsGuard,
    ServiceRequestNonceService,
  ],
  exports: [ConnectServiceConfigService],
})
export class ConnectServiceConfigModule {}