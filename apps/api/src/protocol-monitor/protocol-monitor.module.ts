import { Module } from '@nestjs/common';
import { ProtocolMonitorController } from './protocol-monitor.controller';
import { ProtocolMonitorService } from './protocol-monitor.service';

@Module({
  controllers: [ProtocolMonitorController],
  providers: [ProtocolMonitorService],
})
export class ProtocolMonitorModule {}