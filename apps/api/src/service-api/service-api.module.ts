import { Module } from '@nestjs/common';
import { ServiceApiController } from './service-api.controller';
import { ServiceApiService } from './service-api.service';
import { ServiceCredentialsGuard } from './service-credentials.guard';
import { ServicesModule } from '../services/services.module';
import { ServiceRequestNonceService } from './service-request-nonce.service';

@Module({
  imports: [ServicesModule],
  controllers: [ServiceApiController],
  providers: [
    ServiceApiService,
    ServiceCredentialsGuard,
    ServiceRequestNonceService,
  ],
})
export class ServiceApiModule {}