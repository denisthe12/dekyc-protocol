import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { SolanaModule } from '@/modules/solana/solana.module';

@Module({
  imports: [SolanaModule],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}