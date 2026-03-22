import { Module } from '@nestjs/common';
import { ServiceAuthController } from './service-auth.controller';
import { ServiceAuthService } from './service-auth.service';
import { ServiceApiModule } from '../service-api/service-api.module';
import { ServicesModule } from '../services/services.module';
import { ServiceCredentialsGuard } from '../service-api/service-credentials.guard';
import { ServiceRequestNonceService } from '../service-api/service-request-nonce.service';

@Module({
  imports: [ServiceApiModule, ServicesModule],
  controllers: [ServiceAuthController],
  providers: [
    ServiceAuthService,
    ServiceCredentialsGuard,
    ServiceRequestNonceService,
  ],
})
export class ServiceAuthModule {}