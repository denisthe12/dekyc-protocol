import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { CreatedEnergyAssetResult } from '@/modules/energy/energy-blockchain.service';
import { toCanonicalJson } from '@/modules/energy/utils/canonical-json.util';

@Injectable()
export class EnergyAssetsService {
  public constructor(private readonly prisma: PrismaService) {}

  public async createDemoAsset(onchain: CreatedEnergyAssetResult) {
    return this.prisma.energyAsset.create({
      data: {
        assetId: onchain.assetId,
        issuerEnergyUserId: null,
        title: onchain.metadata.title,
        description: onchain.metadata.description,
        location: onchain.metadata.location,
        assetType: onchain.metadata.assetType,
        totalShares: onchain.metadata.totalShares,
        pricePerShareKzte: onchain.metadata.pricePerShareKzte,
        investorBps: onchain.metadata.investorBps,
        operatorBps: onchain.metadata.operatorBps,
        payoutMode: onchain.metadata.payoutMode,
        status: 'ACTIVE_SALE',
        assetPda: onchain.assetPda,
        registryPda: onchain.registryPda,
        shareMintAddress: onchain.shareMint,
        treasuryShareAccount: onchain.treasuryShareAccount,
        treasuryKzteAccount: onchain.treasuryKzteAccount,
        proofRootHash: '0'.repeat(64),
        metadataUriHash: onchain.metadataHash,
        metadataJson: onchain.metadata,
        metadataCanonicalJson: toCanonicalJson(onchain.metadata),
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