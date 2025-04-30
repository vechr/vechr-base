/*
  Warnings:

  - Added the required column `nodeId` to the `widgets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "widgets" ADD COLUMN     "nodeId" VARCHAR(50) NOT NULL;
