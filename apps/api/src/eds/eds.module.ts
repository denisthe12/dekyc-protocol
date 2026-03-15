import { Module } from '@nestjs/common';
import { EdsController } from './eds.controller';
import { EdsService } from './eds.service';

@Module({
  controllers: [EdsController],
  providers: [EdsService],
})
export class EdsModule {}