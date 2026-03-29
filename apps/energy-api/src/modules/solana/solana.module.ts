import { Module } from '@nestjs/common';
import { SolanaController } from './solana.controller';
import { SolanaService } from './solana.service';
import { Token2022Service } from './token-2022.service';

@Module({
  controllers: [SolanaController],
  providers: [SolanaService, Token2022Service],
  exports: [SolanaService, Token2022Service],
})
export class SolanaModule {}