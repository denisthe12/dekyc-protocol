-- CreateTable
CREATE TABLE "EnergyDekycConnectLogin" (
    "id" TEXT NOT NULL,
    "energyUserId" VARCHAR(191) NOT NULL,
    "dekycServiceId" VARCHAR(191) NOT NULL,
    "subjectId" VARCHAR(128) NOT NULL,
    "serviceSubjectId" VARCHAR(128) NOT NULL,
    "consentId" VARCHAR(128) NOT NULL,
    "assertionId" VARCHAR(128) NOT NULL,
    "consentReceiptHash" VARCHAR(128) NOT NULL,
    "assertionAlgorithm" VARCHAR(32) NOT NULL,
    "assertionJws" TEXT NOT NULL,
    "assertionPayloadJson" JSONB NOT NULL,
    "consentReceiptJson" JSONB NOT NULL,
    "minimalClaimsJson" JSONB,
    "revocationStatus" VARCHAR(32) NOT NULL,
    "assertionIssuedAt" TIMESTAMP(3) NOT NULL,
    "assertionExpiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnergyDekycConnectLogin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnergyDekycConnectLogin_assertionId_key" ON "EnergyDekycConnectLogin"("assertionId");

-- CreateIndex
CREATE INDEX "EnergyDekycConnectLogin_energyUserId_idx" ON "EnergyDekycConnectLogin"("energyUserId");

-- CreateIndex
CREATE INDEX "EnergyDekycConnectLogin_dekycServiceId_idx" ON "EnergyDekycConnectLogin"("dekycServiceId");

-- CreateIndex
CREATE INDEX "EnergyDekycConnectLogin_serviceSubjectId_idx" ON "EnergyDekycConnectLogin"("serviceSubjectId");

-- CreateIndex
CREATE INDEX "EnergyDekycConnectLogin_consentId_idx" ON "EnergyDekycConnectLogin"("consentId");

-- CreateIndex
CREATE INDEX "EnergyDekycConnectLogin_assertionId_idx" ON "EnergyDekycConnectLogin"("assertionId");

-- CreateIndex
CREATE INDEX "EnergyDekycConnectLogin_consentReceiptHash_idx" ON "EnergyDekycConnectLogin"("consentReceiptHash");

-- CreateIndex
CREATE INDEX "EnergyDekycConnectLogin_assertionExpiresAt_idx" ON "EnergyDekycConnectLogin"("assertionExpiresAt");

-- CreateIndex
CREATE INDEX "EnergyDekycConnectLogin_createdAt_idx" ON "EnergyDekycConnectLogin"("createdAt");

-- AddForeignKey
ALTER TABLE "EnergyDekycConnectLogin" ADD CONSTRAINT "EnergyDekycConnectLogin_energyUserId_fkey" FOREIGN KEY ("energyUserId") REFERENCES "EnergyUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
