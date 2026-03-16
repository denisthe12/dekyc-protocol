-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "middleName" TEXT,
    "iin" TEXT,
    "email" TEXT,
    "birthDate" TEXT,
    "gender" TEXT,
    "birthCentury" INTEGER,
    "certificateSerialNumber" TEXT,
    "certificateFingerprint256" TEXT NOT NULL,
    "certificateIssuer" TEXT,
    "certificateSubject" TEXT,
    "validFrom" TEXT,
    "validTo" TEXT,
    "rawCertificateLabJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "middleName" TEXT,
    "iin" TEXT,
    "email" TEXT,
    "birthDate" TEXT,
    "gender" TEXT,
    "country" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source" TEXT NOT NULL DEFAULT 'eds_and_manual',
    "profileJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserCert_certificateFingerprint256_key" ON "UserCert"("certificateFingerprint256");

-- CreateIndex
CREATE INDEX "UserCert_userId_idx" ON "UserCert"("userId");

-- CreateIndex
CREATE INDEX "UserCert_iin_idx" ON "UserCert"("iin");

-- CreateIndex
CREATE INDEX "KycProfile_userId_idx" ON "KycProfile"("userId");

-- CreateIndex
CREATE INDEX "KycProfile_iin_idx" ON "KycProfile"("iin");

-- AddForeignKey
ALTER TABLE "UserCert" ADD CONSTRAINT "UserCert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycProfile" ADD CONSTRAINT "KycProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
