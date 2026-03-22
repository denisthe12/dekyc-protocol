import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { GrantPermissionDto } from './dto/grant-permission.dto';
import { RevokePermissionDto } from './dto/revoke-permission.dto';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('grant')
  grant(
    @Req() req: Request & { user: { sub: string; email: string } },
    @Body() body: GrantPermissionDto,
  ): Promise<unknown> {
    return this.permissionsService.grantPermission(req.user.sub, body);
  }

  @Post('revoke')
  revoke(
    @Req() req: Request & { user: { sub: string; email: string } },
    @Body() body: RevokePermissionDto,
  ): Promise<unknown> {
    return this.permissionsService.revokePermission(req.user.sub, body);
  }

  @Get('my')
  getMy(
    @Req() req: Request & { user: { sub: string; email: string } },
  ): Promise<unknown> {
    return this.permissionsService.getMyPermissions(req.user.sub);
  }
    
  @Get('user-facing')
  getUserFacing(
    @Req() req: Request & { user: { sub: string; email: string } },
  ): Promise<unknown> {
    return this.permissionsService.getUserFacingPermissions(req.user.sub);
  }
}