/*
  Warnings:

  - Made the column `node` on table `widgets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `widgetData` on table `widgets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nodeId` on table `widgets` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "widgets" ALTER COLUMN "node" SET NOT NULL,
ALTER COLUMN "widgetData" SET NOT NULL,
ALTER COLUMN "nodeId" SET NOT NULL;
