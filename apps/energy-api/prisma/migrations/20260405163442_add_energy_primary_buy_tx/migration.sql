-- CreateTable
CREATE TABLE "EnergyPrimaryBuyTx" (
    "id" TEXT NOT NULL,
    "energyUserId" VARCHAR(191) NOT NULL,
    "energyAssetId" VARCHAR(191) NOT NULL,
    "assetId" VARCHAR(128) NOT NULL,
    "assetPda" VARCHAR(128) NOT NULL,
    "shareMintAddress" VARCHAR(128) NOT NULL,
    "buyerWalletAddress" VARCHAR(128) NOT NULL,
    "buyerKzteAccount" VARCHAR(128),
    "buyerShareAccount" VARCHAR(128) NOT NULL,
    "payoutMode" "EnergyPositionPayoutMode" NOT NULL,
    "shareAmount" INTEGER NOT NULL,
    "pricePerShareKzte" INTEGER NOT NULL,
    "totalKzteSpent" INTEGER NOT NULL,
    "txSignature" VARCHAR(128) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnergyPrimaryBuyTx_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnergyPrimaryBuyTx_txSignature_key" ON "EnergyPrimaryBuyTx"("txSignature");

-- CreateIndex
CREATE INDEX "EnergyPrimaryBuyTx_energyUserId_createdAt_idx" ON "EnergyPrimaryBuyTx"("energyUserId", "createdAt");

-- CreateIndex
CREATE INDEX "EnergyPrimaryBuyTx_energyAssetId_createdAt_idx" ON "EnergyPrimaryBuyTx"("energyAssetId", "createdAt");

-- CreateIndex
CREATE INDEX "EnergyPrimaryBuyTx_assetId_createdAt_idx" ON "EnergyPrimaryBuyTx"("assetId", "createdAt");
