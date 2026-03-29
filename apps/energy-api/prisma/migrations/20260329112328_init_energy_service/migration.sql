-- CreateEnum
CREATE TYPE "EnergyUserRole" AS ENUM ('USER', 'ADMIN', 'JUDGE', 'ISSUER');

-- CreateEnum
CREATE TYPE "EnergyWalletStatus" AS ENUM ('PENDING', 'ACTIVE', 'BLOCKED');

-- CreateTable
CREATE TABLE "EnergyUser" (
    "id" TEXT NOT NULL,
    "dekycUserId" TEXT NOT NULL,
    "email" VARCHAR(255),
    "fullName" VARCHAR(255),
    "role" "EnergyUserRole" NOT NULL DEFAULT 'USER',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyUserProfile" (
    "id" TEXT NOT NULL,
    "energyUserId" TEXT NOT NULL,
    "dekycUserId" VARCHAR(191) NOT NULL,
    "email" VARCHAR(255),
    "fullName" VARCHAR(255),
    "iin" VARCHAR(32),
    "birthDate" VARCHAR(64),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "age18Plus" BOOLEAN NOT NULL DEFAULT false,
    "rawClaimsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyUserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyUserWallet" (
    "id" TEXT NOT NULL,
    "energyUserId" TEXT NOT NULL,
    "custodialWalletAddress" VARCHAR(128) NOT NULL,
    "kzteTokenAccountAddress" VARCHAR(128),
    "energyPointsAccountAddress" VARCHAR(128),
    "walletStatus" "EnergyWalletStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyUserWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyUserSession" (
    "id" TEXT NOT NULL,
    "energyUserId" TEXT NOT NULL,
    "accessTokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnergyUserSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnergyUser_dekycUserId_key" ON "EnergyUser"("dekycUserId");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyUserProfile_energyUserId_key" ON "EnergyUserProfile"("energyUserId");

-- CreateIndex
CREATE INDEX "EnergyUserProfile_dekycUserId_idx" ON "EnergyUserProfile"("dekycUserId");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyUserWallet_energyUserId_key" ON "EnergyUserWallet"("energyUserId");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyUserWallet_custodialWalletAddress_key" ON "EnergyUserWallet"("custodialWalletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyUserWallet_kzteTokenAccountAddress_key" ON "EnergyUserWallet"("kzteTokenAccountAddress");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyUserWallet_energyPointsAccountAddress_key" ON "EnergyUserWallet"("energyPointsAccountAddress");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyUserSession_accessTokenHash_key" ON "EnergyUserSession"("accessTokenHash");

-- CreateIndex
CREATE INDEX "EnergyUserSession_energyUserId_idx" ON "EnergyUserSession"("energyUserId");

-- AddForeignKey
ALTER TABLE "EnergyUserProfile" ADD CONSTRAINT "EnergyUserProfile_energyUserId_fkey" FOREIGN KEY ("energyUserId") REFERENCES "EnergyUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnergyUserWallet" ADD CONSTRAINT "EnergyUserWallet_energyUserId_fkey" FOREIGN KEY ("energyUserId") REFERENCES "EnergyUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnergyUserSession" ADD CONSTRAINT "EnergyUserSession_energyUserId_fkey" FOREIGN KEY ("energyUserId") REFERENCES "EnergyUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
