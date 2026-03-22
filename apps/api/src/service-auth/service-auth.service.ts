import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceApiService } from '../service-api/service-api.service';

@Injectable()
export class ServiceAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly serviceApiService: ServiceApiService,
  ) {}

  async login(input: {
    serviceId: string;
    clientId: string;
    nonce: string;
    timestamp: number;
    userId: string;
    biometricMockId: string;
    loginCode: string;
    requestedClaims?: string[];
  }) {
    const normalizedUserId = input.userId.trim();
    const normalizedBiometricMockId = input.biometricMockId.trim();
    const normalizedLoginCode = input.loginCode.trim();

    if (!normalizedUserId || !normalizedBiometricMockId || !normalizedLoginCode) {
      throw new BadRequestException('userId, biometricMockId and loginCode are required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: normalizedUserId },
      select: {
        id: true,
        biometricConfigured: true,
        biometricMockId: true,
        loginCodeHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.biometricConfigured || !user.biometricMockId) {
      throw new UnauthorizedException('Biometric mock is not configured');
    }

    if (user.biometricMockId !== normalizedBiometricMockId) {
      throw new UnauthorizedException('Biometric mock mismatch');
    }

    if (!user.loginCodeHash) {
      throw new UnauthorizedException('Login code not configured');
    }

    const loginCodeHash = createHash('sha256')
      .update(normalizedLoginCode)
      .digest('hex');

    if (loginCodeHash !== user.loginCodeHash) {
      throw new UnauthorizedException('Invalid login code');
    }

    return this.serviceApiService.requestKyc({
      serviceId: input.serviceId,
      clientId: input.clientId,
      nonce: input.nonce,
      timestamp: input.timestamp,
      userId: normalizedUserId,
      requestedClaims: input.requestedClaims,
    });
  }
}