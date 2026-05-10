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
import { PermissionScopeGrantsModule } from './permission-scope-grants/permission-scope-grants.module';
import { ProtocolMonitorModule } from './protocol-monitor/protocol-monitor.module';
import { ServiceAuthModule } from './service-auth/service-auth.module';
import { SubjectsModule } from './subjects/subjects.module';
import { ConsentReceiptsModule } from './consent-receipts/consent-receipts.module';
import { IdentityAssertionsModule } from './identity-assertions/identity-assertions.module';
import { IssuerMetadataModule } from './issuer-metadata/issuer-metadata.module';
import { ConnectModule } from './connect/connect.module';
import { ConnectVerificationModule } from './connect-verification/connect-verification.module';
import { WebhooksModule } from './webhooks/webhooks.module';

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
    PermissionScopeGrantsModule,
    ProtocolMonitorModule,
    ServiceAuthModule,
    SubjectsModule,
    ConsentReceiptsModule,
    IdentityAssertionsModule,
    IssuerMetadataModule,
    ConnectModule,
    ConnectVerificationModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService, DevBootstrapService],
})
export class AppModule {}