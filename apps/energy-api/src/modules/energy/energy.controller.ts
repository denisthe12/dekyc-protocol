import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EnergyBlockchainService } from './energy-blockchain.service';
import { EnergyAssetsService } from '@/modules/energy-assets/energy-assets.service';
import { BuyDemoSharesDto } from './dto/buy-demo-shares.dto';
import { PositionsService } from '@/modules/positions/positions.service';
import { ReconcilePositionDto } from './dto/reconcile-position.dto';

@Controller('energy')
export class EnergyController {
  public constructor(
    private readonly energyBlockchainService: EnergyBlockchainService,
    private readonly energyAssetsService: EnergyAssetsService,
    private readonly positionsService: PositionsService,
  ) {}

  @Post('create-registry')
  public async createRegistry() {
    return this.energyBlockchainService.createRegistryIfNeeded();
  }

  @Post('create-asset')
  public async createAsset() {
    return this.energyBlockchainService.createEnergyAsset();
  }

  @Post('create-demo-asset')
  public async createDemoAsset() {
    const onchain = await this.energyBlockchainService.createEnergyAsset();
    const db = await this.energyAssetsService.createDemoAsset(onchain);

    return {
      onchain,
      db,
    };
  }

  @Post('buy-demo-shares')
  public async buyDemoShares(@Body() dto: BuyDemoSharesDto) {
    return this.energyBlockchainService.buyDemoShares(dto);
  }

  @Post('reconcile-position')
  public async reconcilePosition(@Body() dto: ReconcilePositionDto) {
    return this.positionsService.reconcilePosition(dto);
  }

  @Get('assets')
  public async listAssets() {
    return this.energyAssetsService.listAssets();
  }

  @Get('portfolio/:energyUserId')
  public async getPortfolio(@Param('energyUserId') energyUserId: string) {
    return this.positionsService.getPortfolio(energyUserId);
  }
}