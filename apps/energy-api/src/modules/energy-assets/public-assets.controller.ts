import { Controller, Get, Param } from '@nestjs/common';
import { EnergyAssetsService } from './energy-assets.service';

@Controller('public/assets')
export class PublicAssetsController {
  public constructor(
    private readonly energyAssetsService: EnergyAssetsService,
  ) {}

  @Get()
  public async listPublicAssets() {
    return this.energyAssetsService.listPublicAssets();
  }

  @Get(':assetId')
  public async getPublicAssetPreview(@Param('assetId') assetId: string) {
    return this.energyAssetsService.getPublicAssetPreview(assetId);
  }
}