import { Module } from '@nestjs/common';
import { KycVaultService } from './kyc-vault.service';

@Module({
  providers: [KycVaultService],
  exports: [KycVaultService],
})
export class KycVaultModule {}