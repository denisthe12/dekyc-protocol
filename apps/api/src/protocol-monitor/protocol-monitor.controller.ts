import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProtocolMonitorService } from './protocol-monitor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('protocol-monitor')
@UseGuards(JwtAuthGuard)
export class ProtocolMonitorController {
  constructor(
    private readonly protocolMonitorService: ProtocolMonitorService,
  ) {}

  @Get('snapshot')
  getSnapshot() {
    return this.protocolMonitorService.getSnapshot();
  }
}