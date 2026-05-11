-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "allowedRedirectUris" JSONB,
ADD COLUMN     "allowedScopes" JSONB,
ADD COLUMN     "assertionAudience" TEXT,
ADD COLUMN     "consentTextVersion" TEXT NOT NULL DEFAULT 'dekyc-connect-consent-v1',
ADD COLUMN     "environment" TEXT NOT NULL DEFAULT 'sandbox',
ADD COLUMN     "webhookSigningMode" TEXT NOT NULL DEFAULT 'shared_secret';
