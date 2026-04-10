-- CreateTable
CREATE TABLE "DailyFeatureLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "featureKey" TEXT NOT NULL,
    "logDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyFeatureLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyFeatureLog_userId_logDate_idx" ON "DailyFeatureLog"("userId", "logDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyFeatureLog_userId_featureKey_logDate_key" ON "DailyFeatureLog"("userId", "featureKey", "logDate");

-- AddForeignKey
ALTER TABLE "DailyFeatureLog" ADD CONSTRAINT "DailyFeatureLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
