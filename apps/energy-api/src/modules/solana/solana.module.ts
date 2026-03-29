import { Module } from '@nestjs/common';
import { SolanaController } from './solana.controller';
import { SolanaService } from './solana.service';
import { Token2022Service } from './token-2022.service';
import { AnchorService } from './anchor.service';

@Module({
  controllers: [SolanaController],
  providers: [
    SolanaService,
    Token2022Service,
    {
      provide: AnchorService,
      useFactory: async (solanaService: SolanaService) => {
        return AnchorService.create(solanaService);
      },
      inject: [SolanaService],
    },
  ],
  exports: [SolanaService, Token2022Service, AnchorService],
})
export class SolanaModule {}