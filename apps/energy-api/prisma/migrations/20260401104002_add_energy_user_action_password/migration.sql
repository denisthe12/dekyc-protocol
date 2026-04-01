-- CreateTable
CREATE TABLE "EnergyUserActionPassword" (
    "id" TEXT NOT NULL,
    "energyUserId" VARCHAR(191) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyUserActionPassword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnergyUserActionPassword_energyUserId_key" ON "EnergyUserActionPassword"("energyUserId");

-- CreateIndex
CREATE INDEX "EnergyUserActionPassword_energyUserId_idx" ON "EnergyUserActionPassword"("energyUserId");
