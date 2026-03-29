import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { WalletsModule } from '@/modules/wallets/wallets.module';

@Module({
  imports: [WalletsModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}