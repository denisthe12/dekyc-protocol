/*
  Warnings:

  - Added the required column `metadataCanonicalJson` to the `EnergyAsset` table without a default value. This is not possible if the table is not empty.
  - Made the column `metadataJson` on table `EnergyAsset` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "EnergyAsset" ADD COLUMN     "metadataCanonicalJson" TEXT NOT NULL,
ALTER COLUMN "metadataJson" SET NOT NULL;
