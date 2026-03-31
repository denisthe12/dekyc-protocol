import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { CreateRevenueEpochDto } from './dto/create-revenue-epoch.dto';
import { ClaimPayoutDto } from './dto/claim-payout.dto';

@Controller('payouts')
export class PayoutsController {
  public constructor(private readonly payoutsService: PayoutsService) {}

  @Post('create-epoch')
  public async createEpoch(@Body() dto: CreateRevenueEpochDto) {
    return this.payoutsService.createRevenueEpoch(dto);
  }

  @Post('claim')
  public async claim(@Body() dto: ClaimPayoutDto) {
    return this.payoutsService.claimPayout(dto);
  }

  @Get('epochs/:assetId')
  public async listEpochs(@Param('assetId') assetId: string) {
    return this.payoutsService.listEpochs(assetId);
  }

  @Get('claims/:energyUserId')
  public async listClaims(
    @Param('energyUserId') energyUserId: string,
    @Query('assetId') assetId?: string,
  ) {
    return this.payoutsService.listClaimsForUser({
      energyUserId,
      assetId,
    });
  }
}