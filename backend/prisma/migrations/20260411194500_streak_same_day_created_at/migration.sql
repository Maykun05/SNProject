-- Activity streak: only count logs where calendar entry day matches first-save day (anti backfill).
-- Backfill existing rows so prior behavior stays close to historical data.

ALTER TABLE "MoodLog" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "MoodLog" SET "createdAt" = "date";

ALTER TABLE "Sleep" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "Sleep" SET "createdAt" = "date";

ALTER TABLE "FoodLog" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "FoodLog" SET "createdAt" = "date";

ALTER TABLE "ExerciseDay" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "ExerciseDay" SET "createdAt" = "date";
