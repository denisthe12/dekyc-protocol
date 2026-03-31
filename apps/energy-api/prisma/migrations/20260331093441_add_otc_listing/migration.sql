-- CreateEnum
CREATE TYPE "EnergyOtcListingStatus" AS ENUM ('OPEN', 'FILLED', 'CANCELLED');

-- CreateTable
CREATE TABLE "EnergyOtcListing" (
    "id" TEXT NOT NULL,
    "listingId" VARCHAR(64) NOT NULL,
    "energyAssetId" VARCHAR(191) NOT NULL,
    "sellerEnergyUserId" VARCHAR(191) NOT NULL,
    "buyerEnergyUserId" VARCHAR(191),
    "assetId" VARCHAR(64) NOT NULL,
    "assetPda" VARCHAR(128) NOT NULL,
    "listingPda" VARCHAR(128) NOT NULL,
    "shareMintAddress" VARCHAR(128) NOT NULL,
    "sellerWalletAddress" VARCHAR(128) NOT NULL,
    "sellerShareAccount" VARCHAR(128) NOT NULL,
    "sellerKzteAccount" VARCHAR(128) NOT NULL,
    "escrowShareAccount" VARCHAR(128) NOT NULL,
    "shareAmount" INTEGER NOT NULL,
    "pricePerShareKzte" INTEGER NOT NULL,
    "totalPriceKzte" INTEGER NOT NULL,
    "createListingTx" VARCHAR(128),
    "fillListingTx" VARCHAR(128),
    "status" "EnergyOtcListingStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyOtcListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnergyOtcListing_listingId_key" ON "EnergyOtcListing"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyOtcListing_listingPda_key" ON "EnergyOtcListing"("listingPda");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyOtcListing_escrowShareAccount_key" ON "EnergyOtcListing"("escrowShareAccount");

-- CreateIndex
CREATE INDEX "EnergyOtcListing_energyAssetId_idx" ON "EnergyOtcListing"("energyAssetId");

-- CreateIndex
CREATE INDEX "EnergyOtcListing_sellerEnergyUserId_idx" ON "EnergyOtcListing"("sellerEnergyUserId");

-- CreateIndex
CREATE INDEX "EnergyOtcListing_buyerEnergyUserId_idx" ON "EnergyOtcListing"("buyerEnergyUserId");

-- CreateIndex
CREATE INDEX "EnergyOtcListing_status_idx" ON "EnergyOtcListing"("status");
