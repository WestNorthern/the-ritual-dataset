-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('local', 'google', 'github', 'apple');

-- CreateTable
CREATE TABLE "Witness" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "fullName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Witness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthIdentity" (
    "id" TEXT NOT NULL,
    "witnessId" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "subject" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" CITEXT,
    "passwordHash" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),

    CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Witness_alias_key" ON "Witness"("alias");

-- CreateIndex
CREATE INDEX "AuthIdentity_witnessId_idx" ON "AuthIdentity"("witnessId");

-- CreateIndex
CREATE INDEX "AuthIdentity_email_idx" ON "AuthIdentity"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuthIdentity_provider_subject_key" ON "AuthIdentity"("provider", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "AuthIdentity_provider_email_key" ON "AuthIdentity"("provider", "email");

-- AddForeignKey
ALTER TABLE "AuthIdentity" ADD CONSTRAINT "AuthIdentity_witnessId_fkey" FOREIGN KEY ("witnessId") REFERENCES "Witness"("id") ON DELETE CASCADE ON UPDATE CASCADE;
