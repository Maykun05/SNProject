-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('ActivityLevel1', 'ActivityLevel2', 'ActivityLevel3', 'ActivityLevel4', 'ActivityLevel5');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "age" INTEGER,
    "activityLevel" "ActivityLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "mood" TEXT NOT NULL,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoodLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "MoodLog_userId_date_key" ON "MoodLog"("userId", "date");

-- AddForeignKey
ALTER TABLE "MoodLog" ADD CONSTRAINT "MoodLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
