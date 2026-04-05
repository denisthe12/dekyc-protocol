import { Module } from '@nestjs/common';
import { EnergyAssetsService } from './energy-assets.service';
import { PublicAssetsController } from './public-assets.controller';
import { PrivateAssetsController } from './private-assets.controller';
import { AssetAccessModule } from '@/modules/asset-access/asset-access.module';

@Module({
  imports: [AssetAccessModule],
  providers: [EnergyAssetsService],
  controllers: [PublicAssetsController, PrivateAssetsController],
  exports: [EnergyAssetsService],
})
export class EnergyAssetsModule {}