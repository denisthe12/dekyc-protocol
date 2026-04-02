/*
  Warnings:

  - A unique constraint covering the columns `[energyUserId,energyRevenueEpochId,payoutMode]` on the table `EnergyPayoutClaim` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "EnergyPayoutClaim_energyUserId_energyRevenueEpochId_key";

-- AlterTable
ALTER TABLE "EnergyPayoutClaim" ALTER COLUMN "claimedAmountKzte" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "EnergyPayoutClaim_payoutMode_idx" ON "EnergyPayoutClaim"("payoutMode");

-- CreateIndex
CREATE UNIQUE INDEX "energy_claim_user_epoch_mode_unique" ON "EnergyPayoutClaim"("energyUserId", "energyRevenueEpochId", "payoutMode");
