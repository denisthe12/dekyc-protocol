import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { SettingsService } from './settings.service';
import { SetActionPasswordDto } from './dto/set-action-password.dto';
import { VerifyActionPasswordDto } from './dto/verify-action-password.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  public constructor(private readonly settingsService: SettingsService) {}

  @Get('action-password/status')
  public async getActionPasswordStatus(@Req() req: AuthenticatedRequest) {
    return this.settingsService.getActionPasswordStatus(req.user.id);
  }

  @Post('action-password')
  public async setActionPassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SetActionPasswordDto,
  ) {
    await this.settingsService.setActionPassword({
      energyUserId: req.user.id,
      password: dto.password,
    });

    return {
      ok: true,
    };
  }

  @Post('action-password/verify')
  public async verifyActionPassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: VerifyActionPasswordDto,
  ) {
    return this.settingsService.verifyActionPassword({
      energyUserId: req.user.id,
      password: dto.password,
    });
  }
}