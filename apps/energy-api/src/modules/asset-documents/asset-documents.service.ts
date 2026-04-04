import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { EnergyAssetDocumentType } from '../../../prisma/generated/client';
import { createHash } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join, extname } from 'path';

type UploadDocumentParams = {
  assetId: string;
  documentType: EnergyAssetDocumentType;
  uploadedByEnergyUserId?: string;
  file: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
    size: number;
  };
};

@Injectable()
export class AssetDocumentsService {
  public constructor(private readonly prisma: PrismaService) {}

  private getStorageRoot(): string {
    return join(process.cwd(), 'storage', 'asset-documents');
  }

  private async ensureAssetExists(assetId: string) {
    const asset = await this.prisma.energyAsset.findUnique({
      where: { assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  private sha256Hex(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  private toCanonicalJson(value: unknown): string {
    const normalize = (input: unknown): unknown => {
      if (Array.isArray(input)) {
        return input.map(normalize);
      }

      if (input && typeof input === 'object') {
        return Object.keys(input as Record<string, unknown>)
          .sort()
          .reduce<Record<string, unknown>>((acc, key) => {
            acc[key] = normalize((input as Record<string, unknown>)[key]);
            return acc;
          }, {});
      }

      return input;
    };

    return JSON.stringify(normalize(value));
  }

  public async uploadDocument(params: UploadDocumentParams) {
    const asset = await this.ensureAssetExists(params.assetId);

    const fileHash = this.sha256Hex(params.file.buffer);
    const extension = extname(params.file.originalname || '') || '';
    const safeFileName = `${Date.now()}-${fileHash}${extension}`;
    const storageDir = join(this.getStorageRoot(), asset.assetId);
    const storageKey = join(asset.assetId, safeFileName);
    const absolutePath = join(storageDir, safeFileName);

    await mkdir(storageDir, { recursive: true });
    await writeFile(absolutePath, params.file.buffer);

    const fileUrl = `/uploads/asset-documents/${storageKey.replace(/\\/g, '/')}`;

    const document = await this.prisma.energyAssetDocument.create({
      data: {
        energyAssetId: asset.id,
        documentType: params.documentType,
        fileName: params.file.originalname,
        mimeType: params.file.mimetype,
        storageKey,
        fileUrl,
        sha256Hash: fileHash,
        sizeBytes: params.file.size,
        uploadedByEnergyUserId: params.uploadedByEnergyUserId ?? null,
      },
    });

    return document;
  }

  public async rebuildProofBundle(params: {
    assetId: string;
    createdByEnergyUserId?: string;
  }) {
    const asset = await this.ensureAssetExists(params.assetId);

    const documents = await this.prisma.energyAssetDocument.findMany({
      where: {
        energyAssetId: asset.id,
      },
      orderBy: [
        { documentType: 'asc' },
        { createdAt: 'asc' },
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

    const bundleVersion = (latestBundle?.bundleVersion ?? 0) + 1;

    const manifest = {
      assetId: asset.assetId,
      generatedAt: new Date().toISOString(),
      bundleVersion,
      documents: documents.map((item) => ({
        id: item.id,
        documentType: item.documentType,
        fileName: item.fileName,
        mimeType: item.mimeType,
        fileUrl: item.fileUrl,
        sha256Hash: item.sha256Hash,
        sizeBytes: item.sizeBytes,
        createdAt: item.createdAt.toISOString(),
      })),
    };

    const manifestCanonicalJson = this.toCanonicalJson(manifest);
    const proofRootHash = createHash('sha256')
      .update(manifestCanonicalJson)
      .digest('hex');

    const bundle = await this.prisma.energyAssetProofBundle.create({
      data: {
        energyAssetId: asset.id,
        bundleVersion,
        proofRootHash,
        manifestJson: manifest,
        createdByEnergyUserId: params.createdByEnergyUserId ?? null,
      },
    });

    await this.prisma.energyAsset.update({
      where: {
        id: asset.id,
      },
      data: {
        proofRootHash,
      },
    });

    return {
      assetId: asset.assetId,
      bundleVersion,
      proofRootHash,
      documentCount: documents.length,
      bundle,
    };
  }

  public async listDocuments(assetId: string) {
    const asset = await this.ensureAssetExists(assetId);

    return this.prisma.energyAssetDocument.findMany({
      where: {
        energyAssetId: asset.id,
      },
      orderBy: [
        { documentType: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }
}