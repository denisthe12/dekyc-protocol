import { Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { SolanaModule } from '@/modules/solana/solana.module';

@Module({
  imports: [SolanaModule],
  providers: [PositionsService],
  exports: [PositionsService],
})
export class PositionsModule {}