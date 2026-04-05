-- CreateEnum
CREATE TYPE "EnergyAssetAccessStatus" AS ENUM ('GRANTED', 'REVOKED');

-- CreateTable
CREATE TABLE "EnergyAssetAccess" (
    "id" TEXT NOT NULL,
    "energyUserId" VARCHAR(191) NOT NULL,
    "energyAssetId" VARCHAR(191) NOT NULL,
    "status" "EnergyAssetAccessStatus" NOT NULL DEFAULT 'GRANTED',
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyAssetAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EnergyAssetAccess_energyUserId_idx" ON "EnergyAssetAccess"("energyUserId");

-- CreateIndex
CREATE INDEX "EnergyAssetAccess_energyAssetId_idx" ON "EnergyAssetAccess"("energyAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "energy_user_asset_access_unique" ON "EnergyAssetAccess"("energyUserId", "energyAssetId");

-- AddForeignKey
ALTER TABLE "EnergyAssetAccess" ADD CONSTRAINT "EnergyAssetAccess_energyUserId_fkey" FOREIGN KEY ("energyUserId") REFERENCES "EnergyUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnergyAssetAccess" ADD CONSTRAINT "EnergyAssetAccess_energyAssetId_fkey" FOREIGN KEY ("energyAssetId") REFERENCES "EnergyAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
