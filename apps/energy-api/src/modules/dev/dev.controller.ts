import { Controller, Post } from '@nestjs/common';
import { DevService } from './dev.service';

@Controller('dev')
export class DevController {
  public constructor(private readonly devService: DevService) {}

  @Post('seed-demo-investor')
  public async seedDemoInvestor() {
    return this.devService.seedDemoInvestor();
  }
}