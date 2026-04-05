import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AssetAccessService } from './asset-access.service';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@Controller('asset-access')
@UseGuards(JwtAuthGuard)
export class AssetAccessController {
  public constructor(private readonly assetAccessService: AssetAccessService) {}

  @Get(':assetId')
  public async getAccess(
    @Param('assetId') assetId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.assetAccessService.getAccess({
      energyUserId: req.user.id,
      assetId,
    });
  }

  @Post(':assetId/request')
  public async requestAccess(
    @Param('assetId') assetId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.assetAccessService.requestAccess({
      energyUserId: req.user.id,
      assetId,
    });
  }
}