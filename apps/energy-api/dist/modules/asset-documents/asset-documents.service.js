"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetDocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
const promises_1 = require("fs/promises");
const path_1 = require("path");
let AssetDocumentsService = class AssetDocumentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getStorageRoot() {
        return (0, path_1.join)(process.cwd(), 'storage', 'asset-documents');
    }
    async ensureAssetExists(assetId) {
        const asset = await this.prisma.energyAsset.findUnique({
            where: { assetId },
        });
        if (!asset) {
            throw new common_1.NotFoundException('Asset not found');
        }
        return asset;
    }
    sha256Hex(buffer) {
        return (0, crypto_1.createHash)('sha256').update(buffer).digest('hex');
    }
    toCanonicalJson(value) {
        const normalize = (input) => {
            if (Array.isArray(input)) {
                return input.map(normalize);
            }
            if (input && typeof input === 'object') {
                return Object.keys(input)
                    .sort()
                    .reduce((acc, key) => {
                    acc[key] = normalize(input[key]);
                    return acc;
                }, {});
            }
            return input;
        };
        return JSON.stringify(normalize(value));
    }
    async uploadDocument(params) {
        const asset = await this.ensureAssetExists(params.assetId);
        const fileHash = this.sha256Hex(params.file.buffer);
        const extension = (0, path_1.extname)(params.file.originalname || '') || '';
        const safeFileName = `${Date.now()}-${fileHash}${extension}`;
        const storageDir = (0, path_1.join)(this.getStorageRoot(), asset.assetId);
        const storageKey = (0, path_1.join)(asset.assetId, safeFileName);
        const absolutePath = (0, path_1.join)(storageDir, safeFileName);
        await (0, promises_1.mkdir)(storageDir, { recursive: true });
        await (0, promises_1.writeFile)(absolutePath, params.file.buffer);
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
    async rebuildProofBundle(params) {
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
        const proofRootHash = (0, crypto_1.createHash)('sha256')
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
    async listDocuments(assetId) {
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
};
exports.AssetDocumentsService = AssetDocumentsService;
exports.AssetDocumentsService = AssetDocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssetDocumentsService);
//# sourceMappingURL=asset-documents.service.js.map