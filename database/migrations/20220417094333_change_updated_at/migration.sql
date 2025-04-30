/*
  Warnings:

  - You are about to drop the column `updateAt` on the `dashboards` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `dashboards_devices` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `device_types` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `topic_events` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `topics` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `dashboards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `dashboards_devices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `devices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `device_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `topic_events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `topics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dashboards" DROP COLUMN "updateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "dashboards_devices" DROP COLUMN "updateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "devices" DROP COLUMN "updateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "device_types" DROP COLUMN "updateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "topic_events" DROP COLUMN "updateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "topics" DROP COLUMN "updateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
