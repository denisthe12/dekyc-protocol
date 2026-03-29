import { Controller } from '@nestjs/common';
import { EnergyAssetsService } from './energy-assets.service';

@Controller('energy-assets')
export class EnergyAssetsController {
  constructor(private readonly energyAssetsService: EnergyAssetsService) {}
}
