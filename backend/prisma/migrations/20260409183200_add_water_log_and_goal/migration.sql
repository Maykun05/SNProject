-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "waterGoal" INTEGER;

-- CreateTable
CREATE TABLE "WaterLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amountMl" INTEGER NOT NULL,
    "day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaterLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WaterLog_userId_day_idx" ON "WaterLog"("userId", "day");

-- AddForeignKey
ALTER TABLE "WaterLog" ADD CONSTRAINT "WaterLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
