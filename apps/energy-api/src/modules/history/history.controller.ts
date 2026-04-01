import { Controller, Get, Param } from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
  public constructor(private readonly historyService: HistoryService) {}

  @Get(':energyUserId')
  public async getUserHistory(@Param('energyUserId') energyUserId: string) {
    return this.historyService.getUserHistory(energyUserId);
  }
}