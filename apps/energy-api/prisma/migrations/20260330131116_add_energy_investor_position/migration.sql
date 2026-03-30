-- CreateEnum
CREATE TYPE "EnergyPositionStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateTable
CREATE TABLE "EnergyInvestorPosition" (
    "id" TEXT NOT NULL,
    "energyUserId" VARCHAR(191) NOT NULL,
    "energyAssetId" VARCHAR(191) NOT NULL,
    "assetId" VARCHAR(64) NOT NULL,
    "assetPda" VARCHAR(128) NOT NULL,
    "shareMintAddress" VARCHAR(128) NOT NULL,
    "buyerWalletAddress" VARCHAR(128) NOT NULL,
    "buyerKzteAccount" VARCHAR(128),
    "buyerShareAccount" VARCHAR(128) NOT NULL,
    "totalSharesPurchased" INTEGER NOT NULL DEFAULT 0,
    "totalKzteSpent" INTEGER NOT NULL DEFAULT 0,
    "averagePricePerShare" INTEGER NOT NULL DEFAULT 0,
    "lastPurchaseTx" VARCHAR(128),
    "status" "EnergyPositionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyInvestorPosition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EnergyInvestorPosition_energyUserId_idx" ON "EnergyInvestorPosition"("energyUserId");

-- CreateIndex
CREATE INDEX "EnergyInvestorPosition_energyAssetId_idx" ON "EnergyInvestorPosition"("energyAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyInvestorPosition_energyUserId_energyAssetId_key" ON "EnergyInvestorPosition"("energyUserId", "energyAssetId");
