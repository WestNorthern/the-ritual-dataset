-- CreateEnum
CREATE TYPE "RitualStepKind" AS ENUM ('PREPARATION', 'INVOCATION', 'SILENCE', 'CLOSING');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('RUNNING', 'COMPLETED', 'ABORTED');

-- CreateTable
CREATE TABLE "Ritual" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Ritual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RitualStep" (
    "id" TEXT NOT NULL,
    "ritualId" TEXT NOT NULL,
    "kind" "RitualStepKind" NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT,
    "videoUrl" TEXT NOT NULL,
    "posterUrl" TEXT,
    "autoNext" BOOLEAN NOT NULL DEFAULT true,
    "record" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RitualStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "ritualId" TEXT NOT NULL,
    "witnessId" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'RUNNING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ritual_slug_key" ON "Ritual"("slug");

-- CreateIndex
CREATE INDEX "RitualStep_ritualId_order_idx" ON "RitualStep"("ritualId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "RitualStep_ritualId_order_key" ON "RitualStep"("ritualId", "order");

-- CreateIndex
CREATE INDEX "Session_ritualId_idx" ON "Session"("ritualId");

-- CreateIndex
CREATE INDEX "Session_witnessId_idx" ON "Session"("witnessId");

-- AddForeignKey
ALTER TABLE "RitualStep" ADD CONSTRAINT "RitualStep_ritualId_fkey" FOREIGN KEY ("ritualId") REFERENCES "Ritual"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_ritualId_fkey" FOREIGN KEY ("ritualId") REFERENCES "Ritual"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_witnessId_fkey" FOREIGN KEY ("witnessId") REFERENCES "Witness"("id") ON DELETE SET NULL ON UPDATE CASCADE;
