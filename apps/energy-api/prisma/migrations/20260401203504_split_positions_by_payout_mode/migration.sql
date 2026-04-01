/*
  Warnings:

  - A unique constraint covering the columns `[energyUserId,energyAssetId,payoutMode]` on the table `EnergyInvestorPosition` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "EnergyInvestorPosition_energyUserId_energyAssetId_key";

-- CreateIndex
CREATE INDEX "EnergyInvestorPosition_assetId_idx" ON "EnergyInvestorPosition"("assetId");

-- CreateIndex
CREATE INDEX "EnergyInvestorPosition_payoutMode_idx" ON "EnergyInvestorPosition"("payoutMode");

-- CreateIndex
CREATE UNIQUE INDEX "energy_position_user_asset_mode_unique" ON "EnergyInvestorPosition"("energyUserId", "energyAssetId", "payoutMode");
