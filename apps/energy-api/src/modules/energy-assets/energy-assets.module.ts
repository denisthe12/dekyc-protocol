import { Module } from '@nestjs/common';
import { EnergyAssetsService } from './energy-assets.service';

@Module({
  providers: [EnergyAssetsService],
  exports: [EnergyAssetsService],
})
export class EnergyAssetsModule {}