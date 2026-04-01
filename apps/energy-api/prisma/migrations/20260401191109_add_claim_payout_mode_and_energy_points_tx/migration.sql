-- AlterTable
ALTER TABLE "EnergyPayoutClaim" ADD COLUMN     "energyPointsMintTx" VARCHAR(128),
ADD COLUMN     "payoutMode" "EnergyPositionPayoutMode" NOT NULL DEFAULT 'KZTE';
