import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterServiceDto } from './dto/register-service.dto';
import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}
  
  async registerService(dto: RegisterServiceDto) {
    const clientId = this.generateClientId();
    const clientSecret = this.generateClientSecret();
    const clientSecretHash = await argon2.hash(clientSecret);
    const responseSigningSecret = this.generateResponseSigningSecret();

    const requiredClaims = dto.requiredClaims ?? ['fullName', 'iin', 'birthDate'];
    const optionalClaims = dto.optionalClaims ?? ['email', 'verified', 'age18Plus'];

    const service = await this.prisma.service.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        category: dto.category?.trim() || null,
        clientId,
        clientSecretHash,
        responseSigningSecret,
        requiredClaims,
        optionalClaims,
        allowedRedirectUris: [],
        allowedScopes: [...new Set([...requiredClaims, ...optionalClaims])],
        assertionAudience: clientId,
        webhookSigningMode: 'shared_secret',
        consentTextVersion: 'dekyc-connect-consent-v1',
        environment: 'sandbox',
        status: 'active',
      },
    });

    return {
      service: {
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        clientId: service.clientId,
        status: service.status,
        createdAt: service.createdAt,
      },
      issuedCredentials: {
        clientId,
        clientSecret,
        responseSigningSecret,
      },
    };
  }

  async getAllServices() {
    return this.prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        requiredClaims: true,
        optionalClaims: true,
        clientId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getServiceById(serviceId: string) {
    return this.prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        requiredClaims: true,
        optionalClaims: true,
        clientId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  
  async getServiceByClientIdWithSecrets(clientId: string) {
    return this.prisma.service.findUnique({
      where: { clientId },
    });
  }

    async validateServiceCredentials(clientId: string, clientSecret: string) {
        const service = await this.prisma.service.findUnique({
            where: { clientId },
            });

            if (!service) {
            return null;
            }

            if (service.status !== 'active') {
            return null;
            }

            const ok = await argon2.verify(service.clientSecretHash, clientSecret);

            if (!ok) {
            return null;
        }

    return {
      id: service.id,
      clientId: service.clientId,
      name: service.name,
      status: service.status,
    };
  }

  async getUserFacingCatalog() {
    return this.prisma.service.findMany({
      where: {
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        requiredClaims: true,
        optionalClaims: true,
        status: true,
      },
    });
  }

  private generateClientId(): string {
    return `svc_${randomBytes(12).toString('hex')}`;
  }

  private generateClientSecret(): string {
    return `sk_${randomBytes(24).toString('hex')}`;
  }

  private generateResponseSigningSecret(): string {
    return `resp_${randomBytes(32).toString('hex')}`;
  }
}