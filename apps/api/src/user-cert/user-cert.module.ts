import { Module } from '@nestjs/common';
import { UserCertService } from './user-cert.service';

@Module({
  providers: [UserCertService],
  exports: [UserCertService],
})
export class UserCertModule {}