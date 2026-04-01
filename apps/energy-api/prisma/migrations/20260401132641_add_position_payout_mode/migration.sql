-- CreateEnum
CREATE TYPE "EnergyPositionPayoutMode" AS ENUM ('KZTE', 'ENERGY_POINTS');

-- AlterTable
ALTER TABLE "EnergyInvestorPosition" ADD COLUMN     "payoutMode" "EnergyPositionPayoutMode" NOT NULL DEFAULT 'KZTE';
