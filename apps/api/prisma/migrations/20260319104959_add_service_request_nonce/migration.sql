-- CreateTable
CREATE TABLE "ServiceRequestNonce" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceRequestNonce_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceRequestNonce_serviceId_idx" ON "ServiceRequestNonce"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequestNonce_serviceId_nonce_key" ON "ServiceRequestNonce"("serviceId", "nonce");
