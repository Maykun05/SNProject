/*
  Warnings:

  - You are about to drop the column `age` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "age",
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "selectedFeatures" TEXT[];
