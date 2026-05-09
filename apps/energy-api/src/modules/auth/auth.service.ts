import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DekycLoginCallbackDto } from './dto/dekyc-login-callback.dto';
import { DekycLoginDto } from './dto/dekyc-login.dto';
import { UsersService } from '@/modules/users/users.service';
import { DekycClientService } from '@/modules/dekyc-integration/dekyc-client.service';
import { DekycConnectExchangeDto } from './dto/dekyc-connect-exchange.dto';
import { Prisma } from '../../../prisma/generated/client';
import { PrismaService } from '@/modules/prisma/prisma.service';

@Injectable()
export class AuthService {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly dekycClientService: DekycClientService,
    private readonly prisma: PrismaService,
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

    const assertionPayload = tokenResponse.identityAssertion.payload;
    const consentReceipt = tokenResponse.consentReceipt;

    if (assertionPayload.revocationStatus !== 'active') {
      throw new UnauthorizedException('DeKYC Connect consent is not active');
    }

    if (consentReceipt.status !== 'active') {
      throw new UnauthorizedException('DeKYC Connect consent receipt is not active');
    }

    if (assertionPayload.consentId !== consentReceipt.consentId) {
      throw new UnauthorizedException('DeKYC Connect consent mismatch');
    }

    if (assertionPayload.serviceSubjectId !== consentReceipt.serviceSubjectId) {
      throw new UnauthorizedException('DeKYC Connect service subject mismatch');
    }

    const nowSeconds = Math.floor(Date.now() / 1000);

    if (assertionPayload.exp <= nowSeconds) {
      throw new UnauthorizedException('DeKYC Connect assertion expired');
    }

    const claims = tokenResponse.minimalClaims ?? {};

    const user = await this.usersService.findOrCreateFromDekycEnvelope({
      dekycUserId: assertionPayload.serviceSubjectId,
      claims,
    });

    const loginRecord = await this.prisma.energyDekycConnectLogin.create({
      data: {
        energyUserId: user.id,
        dekycServiceId: assertionPayload.serviceId,
        subjectId: assertionPayload.subjectId,
        serviceSubjectId: assertionPayload.serviceSubjectId,
        consentId: consentReceipt.consentId,
        assertionId: assertionPayload.assertionId,
        consentReceiptHash: consentReceipt.receiptHash,
        assertionAlgorithm: tokenResponse.identityAssertion.algorithm,
        assertionJws: tokenResponse.identityAssertion.assertionJws,
        assertionPayloadJson: this.toInputJson(assertionPayload),
        consentReceiptJson: this.toInputJson(consentReceipt),
        minimalClaimsJson: this.toInputJson(claims),
        revocationStatus: assertionPayload.revocationStatus,
        assertionIssuedAt: new Date(assertionPayload.iat * 1000),
        assertionExpiresAt: new Date(assertionPayload.exp * 1000),
      },
    });

    const accessToken = this.jwtService.sign({
      sub: user.id,
      dekycConnect: {
        loginRecordId: loginRecord.id,
        assertionId: assertionPayload.assertionId,
        consentId: consentReceipt.consentId,
        serviceSubjectId: assertionPayload.serviceSubjectId,
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
        loginRecordId: loginRecord.id,
        assertionId: assertionPayload.assertionId,
        consentId: consentReceipt.consentId,
        serviceSubjectId: assertionPayload.serviceSubjectId,
        consentReceiptHash: consentReceipt.receiptHash,
        assertionExpiresAt: new Date(assertionPayload.exp * 1000).toISOString(),
      },
    };
  }

  private toInputJson(value: unknown): Prisma.InputJsonValue {
    const serialized = JSON.stringify(value);

    if (typeof serialized !== 'string') {
      throw new UnauthorizedException('DeKYC Connect artifact is not JSON serializable');
    }

    return JSON.parse(serialized) as Prisma.InputJsonValue;
  }
}