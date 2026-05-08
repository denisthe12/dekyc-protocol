-- CreateTable
CREATE TABLE "DeKycSubject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeKycSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeKycServiceSubject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "serviceSubjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeKycServiceSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeKycConsentReceipt" (
    "id" TEXT NOT NULL,
    "consentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "serviceSubjectId" TEXT NOT NULL,
    "grantedClaims" JSONB NOT NULL,
    "consentTextVersion" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "receiptHash" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeKycConsentReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeKycAuthorizationCode" (
    "id" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "redirectUri" TEXT NOT NULL,
    "state" TEXT,
    "nonce" TEXT,
    "claimsScope" JSONB NOT NULL,
    "consentId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeKycAuthorizationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeKycIdentityAssertion" (
    "id" TEXT NOT NULL,
    "assertionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "serviceSubjectId" TEXT NOT NULL,
    "consentId" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "assertionJws" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeKycIdentityAssertion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeKycWebhookEndpoint" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secretHash" TEXT NOT NULL,
    "eventTypes" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeKycWebhookEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeKycWebhookDelivery" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "signature" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "DeKycWebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeKycSubject_userId_key" ON "DeKycSubject"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DeKycSubject_subjectId_key" ON "DeKycSubject"("subjectId");

-- CreateIndex
CREATE INDEX "DeKycSubject_subjectId_idx" ON "DeKycSubject"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "DeKycServiceSubject_serviceSubjectId_key" ON "DeKycServiceSubject"("serviceSubjectId");

-- CreateIndex
CREATE INDEX "DeKycServiceSubject_userId_idx" ON "DeKycServiceSubject"("userId");

-- CreateIndex
CREATE INDEX "DeKycServiceSubject_serviceId_idx" ON "DeKycServiceSubject"("serviceId");

-- CreateIndex
CREATE INDEX "DeKycServiceSubject_subjectId_idx" ON "DeKycServiceSubject"("subjectId");

-- CreateIndex
CREATE INDEX "DeKycServiceSubject_serviceSubjectId_idx" ON "DeKycServiceSubject"("serviceSubjectId");

-- CreateIndex
CREATE UNIQUE INDEX "DeKycServiceSubject_userId_serviceId_key" ON "DeKycServiceSubject"("userId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "DeKycConsentReceipt_consentId_key" ON "DeKycConsentReceipt"("consentId");

-- CreateIndex
CREATE INDEX "DeKycConsentReceipt_userId_idx" ON "DeKycConsentReceipt"("userId");

-- CreateIndex
CREATE INDEX "DeKycConsentReceipt_serviceId_idx" ON "DeKycConsentReceipt"("serviceId");

-- CreateIndex
CREATE INDEX "DeKycConsentReceipt_subjectId_idx" ON "DeKycConsentReceipt"("subjectId");

-- CreateIndex
CREATE INDEX "DeKycConsentReceipt_serviceSubjectId_idx" ON "DeKycConsentReceipt"("serviceSubjectId");

-- CreateIndex
CREATE INDEX "DeKycConsentReceipt_status_idx" ON "DeKycConsentReceipt"("status");

-- CreateIndex
CREATE INDEX "DeKycConsentReceipt_consentId_idx" ON "DeKycConsentReceipt"("consentId");

-- CreateIndex
CREATE UNIQUE INDEX "DeKycAuthorizationCode_codeHash_key" ON "DeKycAuthorizationCode"("codeHash");

-- CreateIndex
CREATE INDEX "DeKycAuthorizationCode_userId_idx" ON "DeKycAuthorizationCode"("userId");

-- CreateIndex
CREATE INDEX "DeKycAuthorizationCode_serviceId_idx" ON "DeKycAuthorizationCode"("serviceId");

-- CreateIndex
CREATE INDEX "DeKycAuthorizationCode_consentId_idx" ON "DeKycAuthorizationCode"("consentId");

-- CreateIndex
CREATE INDEX "DeKycAuthorizationCode_expiresAt_idx" ON "DeKycAuthorizationCode"("expiresAt");

-- CreateIndex
CREATE INDEX "DeKycAuthorizationCode_consumedAt_idx" ON "DeKycAuthorizationCode"("consumedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DeKycIdentityAssertion_assertionId_key" ON "DeKycIdentityAssertion"("assertionId");

-- CreateIndex
CREATE INDEX "DeKycIdentityAssertion_userId_idx" ON "DeKycIdentityAssertion"("userId");

-- CreateIndex
CREATE INDEX "DeKycIdentityAssertion_serviceId_idx" ON "DeKycIdentityAssertion"("serviceId");

-- CreateIndex
CREATE INDEX "DeKycIdentityAssertion_subjectId_idx" ON "DeKycIdentityAssertion"("subjectId");

-- CreateIndex
CREATE INDEX "DeKycIdentityAssertion_serviceSubjectId_idx" ON "DeKycIdentityAssertion"("serviceSubjectId");

-- CreateIndex
CREATE INDEX "DeKycIdentityAssertion_consentId_idx" ON "DeKycIdentityAssertion"("consentId");

-- CreateIndex
CREATE INDEX "DeKycIdentityAssertion_expiresAt_idx" ON "DeKycIdentityAssertion"("expiresAt");

-- CreateIndex
CREATE INDEX "DeKycIdentityAssertion_revokedAt_idx" ON "DeKycIdentityAssertion"("revokedAt");

-- CreateIndex
CREATE INDEX "DeKycWebhookEndpoint_serviceId_idx" ON "DeKycWebhookEndpoint"("serviceId");

-- CreateIndex
CREATE INDEX "DeKycWebhookEndpoint_status_idx" ON "DeKycWebhookEndpoint"("status");

-- CreateIndex
CREATE INDEX "DeKycWebhookDelivery_endpointId_idx" ON "DeKycWebhookDelivery"("endpointId");

-- CreateIndex
CREATE INDEX "DeKycWebhookDelivery_eventId_idx" ON "DeKycWebhookDelivery"("eventId");

-- CreateIndex
CREATE INDEX "DeKycWebhookDelivery_eventType_idx" ON "DeKycWebhookDelivery"("eventType");

-- CreateIndex
CREATE INDEX "DeKycWebhookDelivery_status_idx" ON "DeKycWebhookDelivery"("status");

-- CreateIndex
CREATE INDEX "DeKycWebhookDelivery_createdAt_idx" ON "DeKycWebhookDelivery"("createdAt");

-- AddForeignKey
ALTER TABLE "DeKycServiceSubject" ADD CONSTRAINT "DeKycServiceSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "DeKycSubject"("subjectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeKycConsentReceipt" ADD CONSTRAINT "DeKycConsentReceipt_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "DeKycSubject"("subjectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeKycAuthorizationCode" ADD CONSTRAINT "DeKycAuthorizationCode_consentId_fkey" FOREIGN KEY ("consentId") REFERENCES "DeKycConsentReceipt"("consentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeKycIdentityAssertion" ADD CONSTRAINT "DeKycIdentityAssertion_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "DeKycSubject"("subjectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeKycIdentityAssertion" ADD CONSTRAINT "DeKycIdentityAssertion_consentId_fkey" FOREIGN KEY ("consentId") REFERENCES "DeKycConsentReceipt"("consentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeKycWebhookDelivery" ADD CONSTRAINT "DeKycWebhookDelivery_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "DeKycWebhookEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
