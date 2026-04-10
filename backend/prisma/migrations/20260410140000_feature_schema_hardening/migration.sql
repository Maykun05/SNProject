-- Dedupe UserFeature before unique constraint
DELETE FROM "UserFeature" a
USING "UserFeature" b
WHERE a.id > b.id
  AND a."userId" = b."userId"
  AND a."featureId" = b."featureId";

CREATE UNIQUE INDEX "UserFeature_userId_featureId_key" ON "UserFeature"("userId", "featureId");

-- WaterLog: calendar day as TIMESTAMP(3) at UTC midnight (same semantic as YYYY-MM-DD string)
ALTER TABLE "WaterLog" ADD COLUMN "logDate" TIMESTAMP(3);

UPDATE "WaterLog" w
SET "logDate" = CASE
  WHEN w."day" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    THEN (w."day"::date)::timestamp(3)
  ELSE date_trunc('day', w."createdAt")::timestamp(3)
END;

ALTER TABLE "WaterLog" ALTER COLUMN "logDate" SET NOT NULL;

DROP INDEX IF EXISTS "WaterLog_userId_day_idx";
ALTER TABLE "WaterLog" DROP COLUMN "day";
CREATE INDEX "WaterLog_userId_logDate_idx" ON "WaterLog"("userId", "logDate");

-- DailyFeatureLog: featureId FK, drop legacy featureKey
ALTER TABLE "DailyFeatureLog" ADD COLUMN "featureId" INTEGER;

UPDATE "DailyFeatureLog" d
SET "featureId" = mapped.fid
FROM (
  SELECT d2.id,
    CASE n.k
      WHEN 'calorie' THEN (SELECT id FROM "Feature" WHERE name = 'food' LIMIT 1)
      WHEN 'step' THEN (SELECT id FROM "Feature" WHERE name = 'exercise' LIMIT 1)
      ELSE (SELECT id FROM "Feature" f WHERE LOWER(f.name) = n.k LIMIT 1)
    END AS fid
  FROM "DailyFeatureLog" d2
  CROSS JOIN LATERAL (
    SELECT LOWER(regexp_replace(trim(d2."featureKey"), 'feature$', '', 'i')) AS k
  ) n
) AS mapped
WHERE d.id = mapped.id;

DELETE FROM "DailyFeatureLog" WHERE "featureId" IS NULL;

DELETE FROM "DailyFeatureLog" a
USING "DailyFeatureLog" b
WHERE a.id > b.id
  AND a."userId" = b."userId"
  AND a."logDate" = b."logDate"
  AND a."featureId" = b."featureId";

DROP INDEX IF EXISTS "DailyFeatureLog_userId_featureKey_logDate_key";
ALTER TABLE "DailyFeatureLog" DROP COLUMN "featureKey";

ALTER TABLE "DailyFeatureLog" ALTER COLUMN "featureId" SET NOT NULL;

CREATE UNIQUE INDEX "DailyFeatureLog_userId_featureId_logDate_key" ON "DailyFeatureLog"("userId", "featureId", "logDate");

ALTER TABLE "DailyFeatureLog"
  ADD CONSTRAINT "DailyFeatureLog_featureId_fkey"
  FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
