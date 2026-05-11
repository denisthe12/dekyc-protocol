import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectIdService } from './subject-id.service';

@Injectable()
export class SubjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subjectIdService: SubjectIdService,
  ) {}

  async ensureSubjectForUser(userId: string) {
    const existingSubject = await this.prisma.deKycSubject.findUnique({
      where: {
        userId,
      },
    });

    if (existingSubject) {
      return existingSubject;
    }

    try {
      return await this.prisma.deKycSubject.create({
        data: {
          userId,
          subjectId: this.subjectIdService.generateSubjectId(userId),
        },
      });
    } catch (error) {
      if (!this.isUniqueConstraintError(error)) {
        throw error;
      }

      const racedSubject = await this.prisma.deKycSubject.findUnique({
        where: {
          userId,
        },
      });

      if (!racedSubject) {
        throw error;
      }

      return racedSubject;
    }
  }

  async ensureServiceSubject(input: { userId: string; serviceId: string }) {
    const subject = await this.ensureSubjectForUser(input.userId);

    const existingServiceSubject =
      await this.prisma.deKycServiceSubject.findUnique({
        where: {
          userId_serviceId: {
            userId: input.userId,
            serviceId: input.serviceId,
          },
        },
      });

    if (existingServiceSubject) {
      return existingServiceSubject;
    }

    try {
      return await this.prisma.deKycServiceSubject.create({
        data: {
          userId: input.userId,
          serviceId: input.serviceId,
          subjectId: subject.subjectId,
          serviceSubjectId: this.subjectIdService.generateServiceSubjectId({
            userId: input.userId,
            serviceId: input.serviceId,
            subjectId: subject.subjectId,
          }),
        },
      });
    } catch (error) {
      if (!this.isUniqueConstraintError(error)) {
        throw error;
      }

      const racedServiceSubject =
        await this.prisma.deKycServiceSubject.findUnique({
          where: {
            userId_serviceId: {
              userId: input.userId,
              serviceId: input.serviceId,
            },
          },
        });

      if (!racedServiceSubject) {
        throw error;
      }

      return racedServiceSubject;
    }
  }

  async findSubjectByUserId(userId: string) {
    return this.prisma.deKycSubject.findUnique({
      where: {
        userId,
      },
    });
  }

  async findServiceSubject(input: { userId: string; serviceId: string }) {
    return this.prisma.deKycServiceSubject.findUnique({
      where: {
        userId_serviceId: {
          userId: input.userId,
          serviceId: input.serviceId,
        },
      },
    });
  }

  async listServiceSubjectsForUser(userId: string) {
    return this.prisma.deKycServiceSubject.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private isUniqueConstraintError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    if (!('code' in error)) {
      return false;
    }

    const errorWithCode = error as { code?: unknown };

    return errorWithCode.code === 'P2002';
  }
}