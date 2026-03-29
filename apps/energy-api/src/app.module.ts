import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { SolanaModule } from '@/modules/solana/solana.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, SolanaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}