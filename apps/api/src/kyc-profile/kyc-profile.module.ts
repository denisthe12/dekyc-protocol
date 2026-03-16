import { Module } from '@nestjs/common';
import { KycProfileService } from './kyc-profile.service';

@Module({
  providers: [KycProfileService],
  exports: [KycProfileService],
})
export class KycProfileModule {}