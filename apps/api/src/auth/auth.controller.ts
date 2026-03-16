import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';
import { HkdfService } from '../crypto/hkdf.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly hkdfService: HkdfService,
  ) {}

  @Post('signup')
  signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: { sub: string; email: string } }) {
    return this.authService.getMe(req.user.sub);
  }

  @Get('test-hkdf')
  testHkdf() {
    const key = this.hkdfService.derivePermissionKey({
      permissionId: 'perm-test',
      serviceId: 'service-test',
      userId: 'user-test',
    });

    return {
      permissionKey: key,
    };
  }
}