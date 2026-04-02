import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { WalletsModule } from '@/modules/wallets/wallets.module';
import { SolanaModule } from '@/modules/solana/solana.module';
import { UsersController } from './users.controller';

@Module({
  imports: [WalletsModule, SolanaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}