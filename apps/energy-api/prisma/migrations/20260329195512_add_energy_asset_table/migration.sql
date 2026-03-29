-- CreateEnum
CREATE TYPE "EnergyAssetStatus" AS ENUM ('DRAFT', 'ACTIVE_SALE', 'SOLD_OUT', 'PAUSED', 'CLOSED');

-- CreateTable
CREATE TABLE "EnergyAsset" (
    "id" TEXT NOT NULL,
    "assetId" VARCHAR(64) NOT NULL,
    "issuerEnergyUserId" VARCHAR(191),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "location" VARCHAR(255),
    "assetType" VARCHAR(100) NOT NULL,
    "totalShares" INTEGER NOT NULL,
    "pricePerShareKzte" INTEGER NOT NULL,
    "investorBps" INTEGER NOT NULL,
    "operatorBps" INTEGER NOT NULL,
    "payoutMode" VARCHAR(50) NOT NULL,
    "status" "EnergyAssetStatus" NOT NULL DEFAULT 'DRAFT',
    "assetPda" VARCHAR(128) NOT NULL,
    "registryPda" VARCHAR(128) NOT NULL,
    "shareMintAddress" VARCHAR(128) NOT NULL,
    "treasuryShareAccount" VARCHAR(128) NOT NULL,
    "proofRootHash" VARCHAR(128) NOT NULL,
    "metadataUriHash" VARCHAR(128) NOT NULL,
    "createAssetTx" VARCHAR(128),
    "issueSharesTx" VARCHAR(128),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnergyAsset_assetId_key" ON "EnergyAsset"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyAsset_assetPda_key" ON "EnergyAsset"("assetPda");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyAsset_shareMintAddress_key" ON "EnergyAsset"("shareMintAddress");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyAsset_treasuryShareAccount_key" ON "EnergyAsset"("treasuryShareAccount");

-- CreateIndex
CREATE INDEX "EnergyAsset_issuerEnergyUserId_idx" ON "EnergyAsset"("issuerEnergyUserId");

-- CreateIndex
CREATE INDEX "EnergyAsset_status_idx" ON "EnergyAsset"("status");
