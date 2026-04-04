import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { EnergyAssetsService } from './energy-assets.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('assets')
export class PrivateAssetsController {
  public constructor(
    private readonly energyAssetsService: EnergyAssetsService,
  ) {}

  @Get(':assetId')
  @UseGuards(JwtAuthGuard)
  public async getPrivateAssetDetail(@Param('assetId') assetId: string) {
    return this.energyAssetsService.getPrivateAssetDetail(assetId);
  }
}