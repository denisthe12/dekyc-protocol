import { Module } from '@nestjs/common';
import { EdsController } from './eds.controller';
import { EdsService } from './eds.service';
import { UserCertModule } from '../user-cert/user-cert.module';
import { KycProfileModule } from '../kyc-profile/kyc-profile.module';
import { KycVaultModule } from '../kyc-vault/kyc-vault.module';

@Module({
  imports: [UserCertModule, KycProfileModule, KycVaultModule],
  controllers: [EdsController],
  providers: [EdsService],
})
export class EdsModule {}