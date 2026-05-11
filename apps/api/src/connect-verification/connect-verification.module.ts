import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ConnectVerificationController } from './connect-verification.controller';
import { ConnectVerificationService } from './connect-verification.service';

@Module({
  imports: [PrismaModule],
  controllers: [ConnectVerificationController],
  providers: [ConnectVerificationService],
})
export class ConnectVerificationModule {}