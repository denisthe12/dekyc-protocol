-- CreateEnum
CREATE TYPE "EnergyRevenueEpochStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "EnergyRevenueEpoch" (
    "id" TEXT NOT NULL,
    "energyAssetId" VARCHAR(191) NOT NULL,
    "epochIndex" INTEGER NOT NULL,
    "revenueEpochPda" VARCHAR(128) NOT NULL,
    "treasuryKzteAccount" VARCHAR(128) NOT NULL,
    "totalAmountKzte" INTEGER NOT NULL,
    "amountPerShareKzte" INTEGER NOT NULL,
    "totalSharesSnapshot" INTEGER NOT NULL,
    "createEpochTx" VARCHAR(128),
    "status" "EnergyRevenueEpochStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyRevenueEpoch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyPayoutClaim" (
    "id" TEXT NOT NULL,
    "energyUserId" VARCHAR(191) NOT NULL,
    "energyAssetId" VARCHAR(191) NOT NULL,
    "energyRevenueEpochId" VARCHAR(191) NOT NULL,
    "claimReceiptPda" VARCHAR(128) NOT NULL,
    "claimerWalletAddress" VARCHAR(128) NOT NULL,
    "claimerKzteAccount" VARCHAR(128) NOT NULL,
    "claimerShareAccount" VARCHAR(128) NOT NULL,
    "claimedAmountKzte" INTEGER NOT NULL,
    "claimTx" VARCHAR(128),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyPayoutClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnergyRevenueEpoch_revenueEpochPda_key" ON "EnergyRevenueEpoch"("revenueEpochPda");

-- CreateIndex
CREATE INDEX "EnergyRevenueEpoch_energyAssetId_idx" ON "EnergyRevenueEpoch"("energyAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyRevenueEpoch_energyAssetId_epochIndex_key" ON "EnergyRevenueEpoch"("energyAssetId", "epochIndex");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyPayoutClaim_claimReceiptPda_key" ON "EnergyPayoutClaim"("claimReceiptPda");

-- CreateIndex
CREATE INDEX "EnergyPayoutClaim_energyUserId_idx" ON "EnergyPayoutClaim"("energyUserId");

-- CreateIndex
CREATE INDEX "EnergyPayoutClaim_energyAssetId_idx" ON "EnergyPayoutClaim"("energyAssetId");

-- CreateIndex
CREATE INDEX "EnergyPayoutClaim_energyRevenueEpochId_idx" ON "EnergyPayoutClaim"("energyRevenueEpochId");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyPayoutClaim_energyUserId_energyRevenueEpochId_key" ON "EnergyPayoutClaim"("energyUserId", "energyRevenueEpochId");
