-- Add period-scoped mission progress (one row per user/mission/period).
ALTER TABLE "MissionProgress" ADD COLUMN "periodKey" TEXT;

UPDATE "MissionProgress" SET "periodKey" = 'legacy' WHERE "periodKey" IS NULL;

ALTER TABLE "MissionProgress" ALTER COLUMN "periodKey" SET NOT NULL;

DROP INDEX "MissionProgress_userId_missionId_key";

CREATE UNIQUE INDEX "MissionProgress_userId_missionId_periodKey_key" ON "MissionProgress"("userId", "missionId", "periodKey");
