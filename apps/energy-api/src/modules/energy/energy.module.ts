import { Module } from '@nestjs/common';
import { EnergyController } from './energy.controller';
import { EnergyBlockchainService } from './energy-blockchain.service';
import { SolanaModule } from '@/modules/solana/solana.module';
import { EnergyAssetsModule } from '@/modules/energy-assets/energy-assets.module';

@Module({
  imports: [SolanaModule, EnergyAssetsModule],
  controllers: [EnergyController],
  providers: [EnergyBlockchainService],
  exports: [EnergyBlockchainService],
})
export class EnergyModule {}