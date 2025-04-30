/*
  Warnings:

  - You are about to drop the column `hidden` on the `widgets` table. All the data in the column will be lost.
  - You are about to drop the column `persistance` on the `widgets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "widgets" DROP COLUMN "hidden",
DROP COLUMN "persistance",
ADD COLUMN     "shiftData" BOOLEAN;
