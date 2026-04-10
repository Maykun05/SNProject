-- CreateTable
CREATE TABLE "ExerciseDay" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "planJson" JSONB NOT NULL,
    "progressJson" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExerciseDay_userId_date_idx" ON "ExerciseDay"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseDay_userId_date_key" ON "ExerciseDay"("userId", "date");

-- AddForeignKey
ALTER TABLE "ExerciseDay" ADD CONSTRAINT "ExerciseDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
