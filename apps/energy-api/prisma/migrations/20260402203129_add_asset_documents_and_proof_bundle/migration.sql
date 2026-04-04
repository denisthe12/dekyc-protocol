-- CreateEnum
CREATE TYPE "EnergyAssetDocumentType" AS ENUM ('PHOTO', 'TECH_PASSPORT', 'INSTALLER_CERTIFICATE', 'MONTHLY_REPORT', 'GEO_PROOF', 'OTHER');

-- AlterTable
ALTER TABLE "EnergyAsset" ADD COLUMN     "coverImageUrl" VARCHAR(512);

-- CreateTable
CREATE TABLE "EnergyAssetDocument" (
    "id" TEXT NOT NULL,
    "energyAssetId" VARCHAR(191) NOT NULL,
    "documentType" "EnergyAssetDocumentType" NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(128) NOT NULL,
    "storageKey" VARCHAR(512) NOT NULL,
    "fileUrl" VARCHAR(512) NOT NULL,
    "sha256Hash" VARCHAR(64) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedByEnergyUserId" VARCHAR(191),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnergyAssetDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyAssetProofBundle" (
    "id" TEXT NOT NULL,
    "energyAssetId" VARCHAR(191) NOT NULL,
    "bundleVersion" INTEGER NOT NULL,
    "proofRootHash" VARCHAR(64) NOT NULL,
    "manifestJson" JSONB NOT NULL,
    "createdByEnergyUserId" VARCHAR(191),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnergyAssetProofBundle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EnergyAssetDocument_energyAssetId_idx" ON "EnergyAssetDocument"("energyAssetId");

-- CreateIndex
CREATE INDEX "EnergyAssetDocument_documentType_idx" ON "EnergyAssetDocument"("documentType");

-- CreateIndex
CREATE INDEX "EnergyAssetDocument_sha256Hash_idx" ON "EnergyAssetDocument"("sha256Hash");

-- CreateIndex
CREATE INDEX "EnergyAssetProofBundle_energyAssetId_idx" ON "EnergyAssetProofBundle"("energyAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "energy_asset_bundle_version_unique" ON "EnergyAssetProofBundle"("energyAssetId", "bundleVersion");

-- AddForeignKey
ALTER TABLE "EnergyAssetDocument" ADD CONSTRAINT "EnergyAssetDocument_energyAssetId_fkey" FOREIGN KEY ("energyAssetId") REFERENCES "EnergyAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnergyAssetProofBundle" ADD CONSTRAINT "EnergyAssetProofBundle_energyAssetId_fkey" FOREIGN KEY ("energyAssetId") REFERENCES "EnergyAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
