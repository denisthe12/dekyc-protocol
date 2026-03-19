import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceRequestNonceService {
  constructor(private readonly prisma: PrismaService) {}

  async assertNonceUnusedAndStore(serviceId: string, nonce: string) {
    const normalizedNonce = nonce.trim();

    if (!normalizedNonce) {
      throw new UnauthorizedException('Missing nonce');
    }

    const existing = await this.prisma.serviceRequestNonce.findUnique({
      where: {
        serviceId_nonce: {
          serviceId,
          nonce: normalizedNonce,
        },
      },
    });

    if (existing) {
      throw new UnauthorizedException('Replay detected: nonce already used');
    }

    await this.prisma.serviceRequestNonce.create({
      data: {
        serviceId,
        nonce: normalizedNonce,
      },
    });
  }
}