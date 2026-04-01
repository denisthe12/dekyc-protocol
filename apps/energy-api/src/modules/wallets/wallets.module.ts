import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { SolanaModule } from '@/modules/solana/solana.module';
import { PrismaModule } from '@/modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule, SolanaModule],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}