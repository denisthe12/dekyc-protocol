import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EdsModule } from './eds/eds.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserCertModule } from './user-cert/user-cert.module';
import { DevBootstrapService } from './dev/dev-bootstrap.service';
import { KycProfileModule } from './kyc-profile/kyc-profile.module';
import { CryptoModule } from './crypto/crypto.module';
import { KycVaultModule } from './kyc-vault/kyc-vault.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    CryptoModule,
    AuthModule,
    UserCertModule,
    KycProfileModule,
    KycVaultModule,
    EdsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DevBootstrapService],
})
export class AppModule {}