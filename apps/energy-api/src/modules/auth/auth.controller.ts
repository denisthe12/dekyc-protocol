import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { DekycLoginCallbackDto } from './dto/dekyc-login-callback.dto';
import { DekycLoginDto } from './dto/dekyc-login.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUserDecorator } from '@/common/decorators/current-user.decorator';
import { CurrentUser } from '@/modules/users/current-user.type';
import { UsersService } from '@/modules/users/users.service';

@Controller('auth')
export class AuthController {
  public constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('dekyc-login')
  public loginViaDekyc(@Body() dto: DekycLoginDto) {
    return this.authService.loginViaDekycServer(dto);
  }

  @Post('dekyc-login/callback')
  public loginViaDekycCallback(@Body() dto: DekycLoginCallbackDto) {
    return this.authService.loginViaDekycCallback(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  public async getMe(@CurrentUserDecorator() user: CurrentUser) {
    const me = await this.usersService.getMeView(user.id);

    if (!me) {
      throw new NotFoundException('Energy user not found');
    }

    return me;
  }
}