import { Controller, Get, Post } from '@nestjs/common';
import { EnergyBlockchainService } from './energy-blockchain.service';
import { EnergyAssetsService } from '@/modules/energy-assets/energy-assets.service';

@Controller('energy')
export class EnergyController {
  public constructor(
    private readonly energyBlockchainService: EnergyBlockchainService,
    private readonly energyAssetsService: EnergyAssetsService,
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

  @Get('assets')
  public async listAssets() {
    return this.energyAssetsService.listAssets();
  }
}