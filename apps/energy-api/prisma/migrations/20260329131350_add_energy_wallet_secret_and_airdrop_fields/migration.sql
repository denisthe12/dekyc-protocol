-- AlterTable
ALTER TABLE "EnergyUserWallet" ADD COLUMN     "custodialWalletSecretJson" JSONB,
ADD COLUMN     "initialKzteAirdropTx" VARCHAR(128),
ADD COLUMN     "initialKzteAirdropped" BOOLEAN NOT NULL DEFAULT false;
