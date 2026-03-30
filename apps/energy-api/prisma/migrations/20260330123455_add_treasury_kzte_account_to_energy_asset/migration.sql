/*
  Warnings:

  - A unique constraint covering the columns `[treasuryKzteAccount]` on the table `EnergyAsset` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `treasuryKzteAccount` to the `EnergyAsset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EnergyAsset" ADD COLUMN     "treasuryKzteAccount" VARCHAR(128) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EnergyAsset_treasuryKzteAccount_key" ON "EnergyAsset"("treasuryKzteAccount");
