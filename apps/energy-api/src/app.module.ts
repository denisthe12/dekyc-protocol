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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}