/*
  Warnings:

  - The `activityLevel` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "activityLevel",
ADD COLUMN     "activityLevel" INTEGER;

-- DropEnum
DROP TYPE "ActivityLevel";
