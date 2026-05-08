import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DekycLoginCallbackDto } from './dto/dekyc-login-callback.dto';
import { DekycLoginDto } from './dto/dekyc-login.dto';
import { UsersService } from '@/modules/users/users.service';
import { DekycClientService } from '@/modules/dekyc-integration/dekyc-client.service';
import { DekycConnectExchangeDto } from './dto/dekyc-connect-exchange.dto';

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

  public async loginViaDekycConnect(dto: DekycConnectExchangeDto) {
    const tokenResponse = await this.dekycClientService.exchangeConnectCode({
      code: dto.code,
      redirectUri: dto.redirectUri,
    });

    if (tokenResponse.tokenType !== 'dekyc_identity_assertion') {
      throw new UnauthorizedException('Unexpected DeKYC Connect token type');
    }

    if (tokenResponse.identityAssertion.payload.revocationStatus !== 'active') {
      throw new UnauthorizedException('DeKYC Connect consent is not active');
    }

    const nowSeconds = Math.floor(Date.now() / 1000);

    if (tokenResponse.identityAssertion.payload.exp <= nowSeconds) {
      throw new UnauthorizedException('DeKYC Connect assertion expired');
    }

    const claims = tokenResponse.minimalClaims ?? {};

    const user = await this.usersService.findOrCreateFromDekycEnvelope({
      dekycUserId: tokenResponse.identityAssertion.payload.serviceSubjectId,
      claims,
    });

    const accessToken = this.jwtService.sign({
      sub: user.id,
      dekycConnect: {
        assertionId: tokenResponse.identityAssertion.payload.assertionId,
        consentId: tokenResponse.consentReceipt.consentId,
        serviceSubjectId: tokenResponse.identityAssertion.payload.serviceSubjectId,
      },
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
      dekycConnect: {
        assertionId: tokenResponse.identityAssertion.payload.assertionId,
        consentId: tokenResponse.consentReceipt.consentId,
        serviceSubjectId: tokenResponse.identityAssertion.payload.serviceSubjectId,
        consentReceiptHash: tokenResponse.consentReceipt.receiptHash,
        assertionExpiresAt: new Date(
          tokenResponse.identityAssertion.payload.exp * 1000,
        ).toISOString(),
      },
    };
  }
}