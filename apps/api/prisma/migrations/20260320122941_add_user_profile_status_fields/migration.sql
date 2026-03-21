-- AlterTable
ALTER TABLE "User" ADD COLUMN     "biometricConfigured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "biometricMockId" TEXT,
ADD COLUMN     "loginCodeHash" TEXT,
ADD COLUMN     "loginCodeIssuedAt" TIMESTAMP(3);
