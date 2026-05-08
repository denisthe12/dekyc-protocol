import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IdentityAssertionsController } from './identity-assertions.controller';
import { IdentityAssertionsService } from './identity-assertions.service';
import { IdentityAssertionsSigner } from './identity-assertions.signer';

@Module({
  imports: [PrismaModule],
  controllers: [IdentityAssertionsController],
  providers: [IdentityAssertionsService, IdentityAssertionsSigner],
  exports: [IdentityAssertionsService, IdentityAssertionsSigner],
})
export class IdentityAssertionsModule {}