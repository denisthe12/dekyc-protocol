import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConnectVerificationService } from './connect-verification.service';

@Controller('connect-verification')
export class ConnectVerificationController {
  constructor(
    private readonly connectVerificationService: ConnectVerificationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('snapshot')
  getSnapshot() {
    return this.connectVerificationService.getSnapshot();
  }
}