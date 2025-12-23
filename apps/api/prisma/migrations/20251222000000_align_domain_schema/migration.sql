-- AlterEnum: Add EXTRA to RitualStepKind
ALTER TYPE "RitualStepKind" ADD VALUE 'EXTRA';

-- AlterEnum: Recreate SessionStatus with domain-aligned values
-- First, drop the default so we can change the type
ALTER TABLE "Session" ALTER COLUMN "status" DROP DEFAULT;

-- Convert to text temporarily
ALTER TABLE "Session" ALTER COLUMN "status" TYPE TEXT;

-- Update existing values (RUNNING -> IN_PROGRESS, ABORTED -> CANCELLED)
UPDATE "Session" SET "status" = 'IN_PROGRESS' WHERE "status" = 'RUNNING';
UPDATE "Session" SET "status" = 'CANCELLED' WHERE "status" = 'ABORTED';

-- Create new enum type
CREATE TYPE "SessionStatus_new" AS ENUM ('DRAFT', 'IN_PROGRESS', 'SILENCE', 'COMPLETED', 'CANCELLED');

-- Change column to new enum
ALTER TABLE "Session" ALTER COLUMN "status" TYPE "SessionStatus_new" USING ("status"::text::"SessionStatus_new");

-- Drop old enum and rename new one
DROP TYPE "SessionStatus";
ALTER TYPE "SessionStatus_new" RENAME TO "SessionStatus";

-- Restore default
ALTER TABLE "Session" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS'::"SessionStatus";

-- AddColumn: currentStepOrder to Session
ALTER TABLE "Session" ADD COLUMN "currentStepOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateTable: SessionStep
CREATE TABLE "SessionStep" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ritualStepId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "SessionStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionStep_sessionId_idx" ON "SessionStep"("sessionId");
CREATE UNIQUE INDEX "SessionStep_sessionId_order_key" ON "SessionStep"("sessionId", "order");

-- AddForeignKey
ALTER TABLE "SessionStep" ADD CONSTRAINT "SessionStep_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Recording
CREATE TABLE "Recording" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "silenceStepOrder" INTEGER NOT NULL,
    "durationSec" DOUBLE PRECISION NOT NULL,
    "sampleRateHz" INTEGER NOT NULL,
    "channels" INTEGER NOT NULL,
    "codec" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "silenceDetected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recording_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recording_sessionId_key" ON "Recording"("sessionId");

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Survey
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "presenceRating" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Survey_sessionId_key" ON "Survey"("sessionId");

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

