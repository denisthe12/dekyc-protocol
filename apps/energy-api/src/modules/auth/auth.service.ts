import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DekycLoginCallbackDto } from './dto/dekyc-login-callback.dto';
import { DekycLoginDto } from './dto/dekyc-login.dto';
import { UsersService } from '@/modules/users/users.service';
import { DekycClientService } from '@/modules/dekyc-integration/dekyc-client.service';

@Injectable()
export class AuthService {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly dekycClientService: DekycClientService,
  ) {}

  public async loginViaDekycServer(dto: DekycLoginDto) {
    const envelope = await this.dekycClientService.login({
      biometricMockId: dto.biometricMockId,
      loginCode: dto.loginCode,
      requestedClaims: dto.requestedClaims,
    });

    return this.finalizeDekycLogin({
      envelope,
    });
  }

  public async loginViaDekycCallback(dto: DekycLoginCallbackDto) {
    return this.finalizeDekycLogin(dto);
  }

  private async finalizeDekycLogin(dto: {
    envelope: {
      payload: {
        allowed: boolean;
        reason: string;
        claims?: Record<string, unknown> | null;
      };
      resolvedUserId: string;
    };
  }) {
    const { envelope } = dto;

    if (!envelope.payload.allowed) {
      throw new UnauthorizedException(
        envelope.payload.reason || 'DeKYC access denied',
      );
    }

    const user = await this.usersService.findOrCreateFromDekycEnvelope({
      dekycUserId: envelope.resolvedUserId,
      claims: envelope.payload.claims,
    });

    const accessToken = this.jwtService.sign({
      sub: user.id,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        dekycUserId: user.dekycUserId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}