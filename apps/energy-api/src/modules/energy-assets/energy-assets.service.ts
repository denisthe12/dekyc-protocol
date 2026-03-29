import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { CreatedEnergyAssetResult } from '@/modules/energy/energy-blockchain.service';

@Injectable()
export class EnergyAssetsService {
  public constructor(private readonly prisma: PrismaService) {}

  public async createDemoAsset(onchain: CreatedEnergyAssetResult) {
    return this.prisma.energyAsset.create({
      data: {
        assetId: onchain.assetId,
        issuerEnergyUserId: null,
        title: `Solar Roof ${onchain.assetId}`,
        description: 'Demo asset created from energy-api and Anchor program',
        location: 'Aktau, Kazakhstan',
        assetType: 'SOLAR',
        totalShares: 1000,
        pricePerShareKzte: 10000,
        investorBps: 8000,
        operatorBps: 2000,
        payoutMode: 'KZTE',
        status: 'ACTIVE_SALE',
        assetPda: onchain.assetPda,
        registryPda: onchain.registryPda,
        shareMintAddress: onchain.shareMint,
        treasuryShareAccount: onchain.treasuryShareAccount,
        proofRootHash: '0'.repeat(64),
        metadataUriHash: '0'.repeat(64),
        createAssetTx: onchain.createAssetTx,
        issueSharesTx: onchain.issueSharesTx,
      },
    });
  }

  public async listAssets() {
    return this.prisma.energyAsset.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}