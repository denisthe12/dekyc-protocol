import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertKycProfileDto } from './dto/upsert-kyc-profile.dto';

@Injectable()
export class KycProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertKycProfile(dto: UpsertKycProfileDto) {
    const existing = await this.prisma.kycProfile.findFirst({
      where: {
        userId: dto.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const profileJson = {
      fullName: dto.fullName,
      firstName: dto.firstName,
      lastName: dto.lastName,
      middleName: dto.middleName,
      iin: dto.iin,
      email: dto.email,
      birthDate: dto.birthDate,
      gender: dto.gender,
      country: dto.country,
      source: dto.source,
      status: dto.status,
    };

    if (existing) {
      return this.prisma.kycProfile.update({
        where: { id: existing.id },
        data: {
          fullName: dto.fullName,
          firstName: dto.firstName,
          lastName: dto.lastName,
          middleName: dto.middleName,
          iin: dto.iin,
          email: dto.email,
          birthDate: dto.birthDate,
          gender: dto.gender,
          country: dto.country,
          source: dto.source,
          status: dto.status,
          profileJson,
        },
      });
    }

    return this.prisma.kycProfile.create({
      data: {
        userId: dto.userId,
        fullName: dto.fullName,
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        iin: dto.iin,
        email: dto.email,
        birthDate: dto.birthDate,
        gender: dto.gender,
        country: dto.country,
        source: dto.source,
        status: dto.status,
        profileJson,
      },
    });
  }

  async getLatestUserKycProfile(userId: string) {
    return this.prisma.kycProfile.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}