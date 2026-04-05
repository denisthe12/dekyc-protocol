import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { SolanaModule } from '@/modules/solana/solana.module';
import { WalletsModule } from '@/modules/wallets/wallets.module';
import { EnergyModule } from '@/modules/energy/energy.module';
import { EnergyAssetsModule } from '@/modules/energy-assets/energy-assets.module';
import { PositionsModule } from '@/modules/positions/positions.module';
import { PayoutsModule } from '@/modules/payouts/payouts.module';
import { JudgeModule } from '@/modules/judge/judge.module';
import { OtcModule } from '@/modules/otc/otc.module';
import { DevModule } from '@/modules/dev/dev.module';
import { HistoryModule } from '@/modules/history/history.module';
import { SettingsModule } from '@/modules/settings/settings.module';
import { AssetDocumentsModule } from '@/modules/asset-documents/asset-documents.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AssetAccessModule } from '@/modules/asset-access/asset-access.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    SolanaModule,
    WalletsModule,
    EnergyModule,
    EnergyAssetsModule,
    PositionsModule,
    PayoutsModule,
    JudgeModule,
    OtcModule,
    DevModule,
    HistoryModule,
    SettingsModule,
    AssetDocumentsModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'storage'),
      serveRoot: '/uploads',
    }),
    AssetAccessModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}