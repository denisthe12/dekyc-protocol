import { Controller, Get, Param, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';
import { EnergyAssetsService } from './energy-assets.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AssetAccessService } from '@/modules/asset-access/asset-access.service';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@Controller('assets')
export class PrivateAssetsController {
  public constructor(
    private readonly energyAssetsService: EnergyAssetsService,
    private readonly assetAccessService: AssetAccessService,
  ) {}

  @Get(':assetId')
  @UseGuards(JwtAuthGuard)
  public async getPrivateAssetDetail(
    @Param('assetId') assetId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const access = await this.assetAccessService.getAccess({
      energyUserId: req.user.id,
      assetId,
    });

    if (!access.hasAccess) {
      throw new ForbiddenException('Asset access is not granted');
    }

    return this.energyAssetsService.getPrivateAssetDetail(assetId);
  }
}