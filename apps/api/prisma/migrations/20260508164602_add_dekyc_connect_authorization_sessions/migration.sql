-- CreateTable
CREATE TABLE "DeKycConnectAuthorizationSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "redirectUri" TEXT NOT NULL,
    "state" TEXT,
    "nonce" TEXT,
    "claimsScope" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" TEXT,
    "consentId" TEXT,
    "codeHash" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeKycConnectAuthorizationSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeKycConnectAuthorizationSession_sessionId_key" ON "DeKycConnectAuthorizationSession"("sessionId");

-- CreateIndex
CREATE INDEX "DeKycConnectAuthorizationSession_sessionId_idx" ON "DeKycConnectAuthorizationSession"("sessionId");

-- CreateIndex
CREATE INDEX "DeKycConnectAuthorizationSession_serviceId_idx" ON "DeKycConnectAuthorizationSession"("serviceId");

-- CreateIndex
CREATE INDEX "DeKycConnectAuthorizationSession_clientId_idx" ON "DeKycConnectAuthorizationSession"("clientId");

-- CreateIndex
CREATE INDEX "DeKycConnectAuthorizationSession_userId_idx" ON "DeKycConnectAuthorizationSession"("userId");

-- CreateIndex
CREATE INDEX "DeKycConnectAuthorizationSession_consentId_idx" ON "DeKycConnectAuthorizationSession"("consentId");

-- CreateIndex
CREATE INDEX "DeKycConnectAuthorizationSession_codeHash_idx" ON "DeKycConnectAuthorizationSession"("codeHash");

-- CreateIndex
CREATE INDEX "DeKycConnectAuthorizationSession_status_idx" ON "DeKycConnectAuthorizationSession"("status");

-- CreateIndex
CREATE INDEX "DeKycConnectAuthorizationSession_expiresAt_idx" ON "DeKycConnectAuthorizationSession"("expiresAt");
