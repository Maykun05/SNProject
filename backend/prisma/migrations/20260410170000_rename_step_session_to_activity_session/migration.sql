-- RenameTable: StepSession -> ActivitySession
ALTER TABLE "StepSession" RENAME TO "ActivitySession";

ALTER INDEX "StepSession_pkey" RENAME TO "ActivitySession_pkey";

ALTER TABLE "ActivitySession" RENAME CONSTRAINT "StepSession_userId_fkey" TO "ActivitySession_userId_fkey";
