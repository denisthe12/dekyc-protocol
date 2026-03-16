-- CreateTable
CREATE TABLE "KycVaultEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kycProfileId" TEXT NOT NULL,
    "kycHash" TEXT NOT NULL,
    "cipherText" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "keyVersion" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'aes-256-gcm',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycVaultEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KycVaultEntry_userId_idx" ON "KycVaultEntry"("userId");

-- CreateIndex
CREATE INDEX "KycVaultEntry_kycProfileId_idx" ON "KycVaultEntry"("kycProfileId");

-- CreateIndex
CREATE INDEX "KycVaultEntry_kycHash_idx" ON "KycVaultEntry"("kycHash");
