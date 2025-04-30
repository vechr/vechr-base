/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `devices` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "topic_events_name_key";

-- DropIndex
DROP INDEX "topics_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "devices_name_key" ON "devices"("name");
