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
import { SolanaService } from '../solana/solana.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly hkdfService: HkdfService,
    private readonly solanaService: SolanaService,
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

  @Get('solana-debug')
  solanaDebug() {
    return {
      programId: this.solanaService.getProgramId().toBase58(),
      wallet: this.solanaService.getWalletPubkey().toBase58(),
    };
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('solana-register-user')
  async solanaRegisterUser(@Req() req: any) {
  const userId: string = req.user.sub;

  const result = await this.solanaService.registerUserOnChain(userId);

  return {
    message: 'User registered on-chain',
    ...result,
  };
}
}