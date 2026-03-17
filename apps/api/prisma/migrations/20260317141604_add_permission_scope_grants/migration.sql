-- CreateTable
CREATE TABLE "PermissionScopeGrant" (
    "id" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "requiredAmount" INTEGER NOT NULL DEFAULT 1,
    "mintAddress" TEXT,
    "tokenAccountAddress" TEXT,
    "tokenProgram" TEXT,
    "balanceCheckMode" TEXT NOT NULL DEFAULT 'gte',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "PermissionScopeGrant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PermissionScopeGrant_permissionId_idx" ON "PermissionScopeGrant"("permissionId");

-- CreateIndex
CREATE INDEX "PermissionScopeGrant_serviceId_idx" ON "PermissionScopeGrant"("serviceId");

-- CreateIndex
CREATE INDEX "PermissionScopeGrant_scope_idx" ON "PermissionScopeGrant"("scope");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionScopeGrant_permissionId_scope_key" ON "PermissionScopeGrant"("permissionId", "scope");

-- AddForeignKey
ALTER TABLE "PermissionScopeGrant" ADD CONSTRAINT "PermissionScopeGrant_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionScopeGrant" ADD CONSTRAINT "PermissionScopeGrant_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
