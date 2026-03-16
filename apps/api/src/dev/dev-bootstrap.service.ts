import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DevBootstrapService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const existing = await this.prisma.user.findUnique({
      where: { email: 'demo@dekyc.local' },
    });

    if (!existing) {
      await this.prisma.user.create({
        data: {
          email: 'demo@dekyc.local',
          passwordHash: 'dev-placeholder-hash',
          emailVerified: true,
        },
      });
    }
  }
}