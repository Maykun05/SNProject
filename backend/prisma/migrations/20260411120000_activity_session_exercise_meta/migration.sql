-- AlterTable
ALTER TABLE "ActivitySession" ADD COLUMN "planDateKey" TEXT,
ADD COLUMN "instanceId" TEXT,
ADD COLUMN "activityKey" TEXT,
ADD COLUMN "laps" INTEGER,
ADD COLUMN "sets" INTEGER,
ADD COLUMN "reps" INTEGER,
ADD COLUMN "customGoalJson" JSONB,
ADD COLUMN "isQualified" BOOLEAN;

CREATE INDEX "ActivitySession_userId_planDateKey_instanceId_idx" ON "ActivitySession"("userId", "planDateKey", "instanceId");
