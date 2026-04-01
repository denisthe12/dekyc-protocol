import { Module } from '@nestjs/common';
import { SolanaController } from './solana.controller';
import { SolanaService } from './solana.service';
import { Token2022Service } from './token-2022.service';
import { AnchorService } from './anchor.service';
import { EnergyPointsService } from './energy-points.service';

@Module({
  controllers: [SolanaController],
  providers: [
    SolanaService,
    Token2022Service,
    EnergyPointsService,
    {
      provide: AnchorService,
      useFactory: async (solanaService: SolanaService) => {
        return AnchorService.create(solanaService);
      },
      inject: [SolanaService],
    },
  ],
  exports: [SolanaService, Token2022Service, AnchorService, EnergyPointsService],
})
export class SolanaModule {}