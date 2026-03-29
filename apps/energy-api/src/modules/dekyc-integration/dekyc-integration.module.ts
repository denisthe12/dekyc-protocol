import { Module } from '@nestjs/common';
import { DekycClientService } from './dekyc-client.service';

@Module({
  providers: [DekycClientService],
  exports: [DekycClientService],
})
export class DekycIntegrationModule {}