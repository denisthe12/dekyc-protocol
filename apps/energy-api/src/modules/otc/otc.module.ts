import { Module } from '@nestjs/common';
import { OtcService } from './otc.service';
import { OtcController } from './otc.controller';
import { SolanaModule } from '@/modules/solana/solana.module';

@Module({
  imports: [SolanaModule],
  providers: [OtcService],
  controllers: [OtcController],
  exports: [OtcService],
})
export class OtcModule {}