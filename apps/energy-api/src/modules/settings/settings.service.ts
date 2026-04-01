import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '@/modules/prisma/prisma.service';

@Injectable()
export class SettingsService {
  public constructor(private readonly prisma: PrismaService) {}

  public async setActionPassword(params: {
    energyUserId: string;
    password: string;
  }) {
    const passwordHash = await argon2.hash(params.password);

    const existing = await this.prisma.energyUserActionPassword.findUnique({
      where: {
        energyUserId: params.energyUserId,
      },
    });

    if (!existing) {
      return this.prisma.energyUserActionPassword.create({
        data: {
          energyUserId: params.energyUserId,
          passwordHash,
        },
      });
    }

    return this.prisma.energyUserActionPassword.update({
      where: {
        energyUserId: params.energyUserId,
      },
      data: {
        passwordHash,
      },
    });
  }

  public async verifyActionPassword(params: {
    energyUserId: string;
    password: string;
  }): Promise<{ valid: true }> {
    const record = await this.prisma.energyUserActionPassword.findUnique({
      where: {
        energyUserId: params.energyUserId,
      },
    });

    if (!record) {
      throw new UnauthorizedException('Action password is not set');
    }

    const valid = await argon2.verify(record.passwordHash, params.password);

    if (!valid) {
      throw new UnauthorizedException('Invalid action password');
    }

    return { valid: true };
  }

  public async getActionPasswordStatus(energyUserId: string): Promise<{
    isSet: boolean;
  }> {
    const record = await this.prisma.energyUserActionPassword.findUnique({
      where: {
        energyUserId,
      },
      select: {
        id: true,
      },
    });

    return {
      isSet: Boolean(record),
    };
  }
}