-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "category" TEXT,
ADD COLUMN     "optionalClaims" JSONB,
ADD COLUMN     "requiredClaims" JSONB;
