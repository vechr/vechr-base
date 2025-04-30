-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "Audit" (
    "id" VARCHAR(36) NOT NULL,
    "auditable" VARCHAR(30) NOT NULL,
    "auditableId" VARCHAR(36) NOT NULL,
    "changeCount" INTEGER NOT NULL DEFAULT 0,
    "previous" JSONB,
    "incoming" JSONB,
    "action" "AuditAction" NOT NULL,
    "username" VARCHAR(50),
    "userId" VARCHAR(36) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Audit_auditable_auditableId_idx" ON "Audit"("auditable", "auditableId");

-- CreateIndex
CREATE INDEX "Audit_userId_idx" ON "Audit"("userId");
