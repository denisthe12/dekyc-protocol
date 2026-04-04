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

        // legacy/default field on asset level
        payoutMode: 'KZTE',

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

  public async listPublicAssets() {
    const assets = await this.prisma.energyAsset.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    const items = await Promise.all(
      assets.map(async (asset) => {
        const soldSharesAggregate =
          await this.prisma.energyInvestorPosition.aggregate({
            _sum: {
              totalSharesPurchased: true,
            },
            where: {
              energyAssetId: asset.id,
              status: 'ACTIVE',
            },
          });

        const soldShares = soldSharesAggregate._sum.totalSharesPurchased ?? 0;
        const remainingShares = Math.max(asset.totalShares - soldShares, 0);

        return {
          assetId: asset.assetId,
          title: asset.title,
          description: asset.description,
          location: asset.location,
          assetType: asset.assetType,
          totalShares: asset.totalShares,
          soldShares,
          remainingShares,
          pricePerShareKzte: asset.pricePerShareKzte,
          investorBps: asset.investorBps,
          operatorBps: asset.operatorBps,
          status: asset.status,
          coverImageUrl:
            asset.coverImageUrl ??
            `/demo-assets/${asset.assetType.toLowerCase()}.jpg`,
          metadataJson: asset.metadataJson,
          supportedPayoutModes:
            (asset.metadataJson as { supportedPayoutModes?: string[] } | null)
              ?.supportedPayoutModes ?? ['KZTE'],
        };
      }),
    );

    return items;
  }

  public async getPublicAssetPreview(assetId: string) {
    const asset = await this.prisma.energyAsset.findUniqueOrThrow({
      where: { assetId },
    });

    const soldSharesAggregate =
      await this.prisma.energyInvestorPosition.aggregate({
        _sum: {
          totalSharesPurchased: true,
        },
        where: {
          energyAssetId: asset.id,
          status: 'ACTIVE',
        },
      });

    const soldShares = soldSharesAggregate._sum.totalSharesPurchased ?? 0;
    const remainingShares = Math.max(asset.totalShares - soldShares, 0);

    const latestBundle = await this.prisma.energyAssetProofBundle.findFirst({
      where: {
        energyAssetId: asset.id,
      },
      orderBy: {
        bundleVersion: 'desc',
      },
    });

    return {
      accessLevel: 'PREVIEW',
      assetId: asset.assetId,
      title: asset.title,
      description: asset.description,
      location: asset.location,
      assetType: asset.assetType,
      totalShares: asset.totalShares,
      soldShares,
      remainingShares,
      pricePerShareKzte: asset.pricePerShareKzte,
      investorBps: asset.investorBps,
      operatorBps: asset.operatorBps,
      status: asset.status,
      coverImageUrl:
        asset.coverImageUrl ??
        `/demo-assets/${asset.assetType.toLowerCase()}.jpg`,
      proofRootHash: asset.proofRootHash,
      metadataUriHash: asset.metadataUriHash,
      assetPda: asset.assetPda,
      registryPda: asset.registryPda,
      shareMintAddress: asset.shareMintAddress,
      treasuryShareAccount: asset.treasuryShareAccount,
      treasuryKzteAccount: asset.treasuryKzteAccount,
      createAssetTx: asset.createAssetTx,
      issueSharesTx: asset.issueSharesTx,
      metadataJson: asset.metadataJson,
      latestProofBundle: latestBundle,
    };
  }

  public async getPrivateAssetDetail(assetId: string) {
    const asset = await this.prisma.energyAsset.findUniqueOrThrow({
      where: { assetId },
    });

    const soldSharesAggregate =
      await this.prisma.energyInvestorPosition.aggregate({
        _sum: {
          totalSharesPurchased: true,
        },
        where: {
          energyAssetId: asset.id,
          status: 'ACTIVE',
        },
      });

    const soldShares = soldSharesAggregate._sum.totalSharesPurchased ?? 0;
    const remainingShares = Math.max(asset.totalShares - soldShares, 0);

    const documents = await this.prisma.energyAssetDocument.findMany({
      where: {
        energyAssetId: asset.id,
      },
      orderBy: [
        { documentType: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    const latestBundle = await this.prisma.energyAssetProofBundle.findFirst({
      where: {
        energyAssetId: asset.id,
      },
      orderBy: {
        bundleVersion: 'desc',
      },
    });

    return {
      accessLevel: 'FULL',
      assetId: asset.assetId,
      title: asset.title,
      description: asset.description,
      location: asset.location,
      assetType: asset.assetType,
      totalShares: asset.totalShares,
      soldShares,
      remainingShares,
      pricePerShareKzte: asset.pricePerShareKzte,
      investorBps: asset.investorBps,
      operatorBps: asset.operatorBps,
      status: asset.status,
      coverImageUrl:
        asset.coverImageUrl ??
        `/demo-assets/${asset.assetType.toLowerCase()}.jpg`,
      proofRootHash: asset.proofRootHash,
      metadataUriHash: asset.metadataUriHash,
      assetPda: asset.assetPda,
      registryPda: asset.registryPda,
      shareMintAddress: asset.shareMintAddress,
      treasuryShareAccount: asset.treasuryShareAccount,
      treasuryKzteAccount: asset.treasuryKzteAccount,
      createAssetTx: asset.createAssetTx,
      issueSharesTx: asset.issueSharesTx,
      metadataJson: asset.metadataJson,
      documents,
      latestProofBundle: latestBundle,
    };
  }
}