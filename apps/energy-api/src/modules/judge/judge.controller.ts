import { Controller, Get } from '@nestjs/common';
import { JudgeService } from './judge.service';

@Controller('judge')
export class JudgeController {
  public constructor(private readonly judgeService: JudgeService) {}

  @Get('summary')
  public async getSummary() {
    return this.judgeService.getJudgeSummary();
  }
}