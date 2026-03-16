import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveUserCertDto } from './dto/save-user-cert.dto';

@Injectable()
export class UserCertService {
  constructor(private readonly prisma: PrismaService) {}

  async saveUserCert(dto: SaveUserCertDto) {
    if (!dto.certificateFingerprint256) {
      throw new Error('certificateFingerprint256 is required');
    }

    const existing = await this.prisma.userCert.findUnique({
      where: {
        certificateFingerprint256: dto.certificateFingerprint256,
      },
    });

    if (existing) {
      return this.prisma.userCert.update({
        where: { id: existing.id },
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
          birthCentury: dto.birthCentury,
          certificateSerialNumber: dto.certificateSerialNumber,
          certificateIssuer: dto.certificateIssuer,
          certificateSubject: dto.certificateSubject,
          validFrom: dto.certificateValidFrom,
          validTo: dto.certificateValidTo,
        },
      });
    }

    return this.prisma.userCert.create({
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
        birthCentury: dto.birthCentury,
        certificateSerialNumber: dto.certificateSerialNumber,
        certificateFingerprint256: dto.certificateFingerprint256,
        certificateIssuer: dto.certificateIssuer,
        certificateSubject: dto.certificateSubject,
        validFrom: dto.certificateValidFrom,
        validTo: dto.certificateValidTo,
      },
    });
  }

  async getAllUserCerts() {
    return this.prisma.userCert.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}