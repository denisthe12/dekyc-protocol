import { Global, Module } from '@nestjs/common';
import { SolanaService } from './solana.service';
import { Token2022Service } from './token-2022.service';

@Global()
@Module({
  providers: [SolanaService, Token2022Service],
  exports: [SolanaService, Token2022Service],
})
export class SolanaModule {}