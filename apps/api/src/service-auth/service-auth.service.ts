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
    biometricMockId: string;
    loginCode: string;
    requestedClaims?: string[];
  }) {

    
    const normalizedBiometricMockId = input.biometricMockId.trim();
    const normalizedLoginCode = input.loginCode.trim();

    const loginCodeHash = createHash('sha256')
      .update(input.loginCode.trim())
      .digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        loginCodeHash,
      },
      select: {
        id: true,
        biometricConfigured: true,
        biometricMockId: true,
        loginCodeHash: true,
      },
    });

    if (!user?.id || !normalizedBiometricMockId || !normalizedLoginCode) {
      throw new BadRequestException('userId, biometricMockId and loginCode are required');
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.biometricConfigured || !user.biometricMockId) {
      throw new UnauthorizedException('Biometric mock is not configured');
    }


    if (!user.loginCodeHash) {
      throw new UnauthorizedException('Login code not configured');
    }

    if (loginCodeHash !== user.loginCodeHash) {
      throw new UnauthorizedException('Invalid login code');
    }

    const envelope = await this.serviceApiService.requestKyc({
      serviceId: input.serviceId,
      clientId: input.clientId,
      nonce: input.nonce,
      timestamp: input.timestamp,
      userId: user.id,
      requestedClaims: input.requestedClaims,
    });

    return {
      ...envelope,
      resolvedUserId: user.id,
    }
  }
}