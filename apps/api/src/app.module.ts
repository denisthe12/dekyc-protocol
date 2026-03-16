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
import { ServicesModule } from './services/services.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ServiceApiModule } from './service-api/service-api.module';
import { SolanaModule } from './solana/solana.module';

@Module({
  imports: [
    PrismaModule,
    CryptoModule,
    AuthModule,
    UserCertModule,
    KycProfileModule,
    KycVaultModule,
    EdsModule,
    PermissionsModule,
    ServicesModule,
    ServiceApiModule,
    SolanaModule,
  ],
  controllers: [AppController],
  providers: [AppService, DevBootstrapService],
})
export class AppModule {}