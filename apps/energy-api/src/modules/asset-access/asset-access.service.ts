import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';

@Injectable()
export class AssetAccessService {
  public constructor(private readonly prisma: PrismaService) {}

  public async getAccess(params: {
    energyUserId: string;
    assetId: string;
  }) {
    const asset = await this.prisma.energyAsset.findUnique({
      where: { assetId: params.assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    const access = await this.prisma.energyAssetAccess.findUnique({
      where: {
        energyUserId_energyAssetId: {
          energyUserId: params.energyUserId,
          energyAssetId: asset.id,
        },
      },
    });

    return {
      assetId: asset.assetId,
      energyUserId: params.energyUserId,
      hasAccess: access?.status === 'GRANTED',
      status: access?.status ?? null,
    };
  }

  public async requestAccess(params: {
    energyUserId: string;
    assetId: string;
  }) {
    const asset = await this.prisma.energyAsset.findUnique({
      where: { assetId: params.assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    const access = await this.prisma.energyAssetAccess.upsert({
      where: {
        energyUserId_energyAssetId: {
          energyUserId: params.energyUserId,
          energyAssetId: asset.id,
        },
      },
      update: {
        status: 'GRANTED',
        grantedAt: new Date(),
      },
      create: {
        energyUserId: params.energyUserId,
        energyAssetId: asset.id,
        status: 'GRANTED',
        grantedAt: new Date(),
      },
    });

    return {
      assetId: asset.assetId,
      energyUserId: params.energyUserId,
      hasAccess: true,
      status: access.status,
    };
  }
}