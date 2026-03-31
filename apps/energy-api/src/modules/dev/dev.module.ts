import { Module } from '@nestjs/common';
import { DevController } from './dev.controller';
import { DevService } from './dev.service';
import { WalletsModule } from '@/modules/wallets/wallets.module';

@Module({
  imports: [WalletsModule],
  controllers: [DevController],
  providers: [DevService],
  exports: [DevService],
})
export class DevModule {}