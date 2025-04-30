/*
  Warnings:

  - You are about to drop the `dashboards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dashboards_devices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `device_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `devices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `topic_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `topics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `widgets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "dashboards_devices" DROP CONSTRAINT "dashboards_devices_dashboardId_fkey";

-- DropForeignKey
ALTER TABLE "dashboards_devices" DROP CONSTRAINT "dashboards_devices_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "devices" DROP CONSTRAINT "devices_deviceTypeId_fkey";

-- DropForeignKey
ALTER TABLE "topic_events" DROP CONSTRAINT "topic_events_topicId_fkey";

-- DropForeignKey
ALTER TABLE "topics" DROP CONSTRAINT "topics_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "widgets" DROP CONSTRAINT "widgets_dashboardId_fkey";

-- DropForeignKey
ALTER TABLE "widgets" DROP CONSTRAINT "widgets_topicId_fkey";

-- DropTable
DROP TABLE "dashboards";

-- DropTable
DROP TABLE "dashboards_devices";

-- DropTable
DROP TABLE "device_types";

-- DropTable
DROP TABLE "devices";

-- DropTable
DROP TABLE "topic_events";

-- DropTable
DROP TABLE "topics";

-- DropTable
DROP TABLE "widgets";

-- CreateTable
CREATE TABLE "Dashboard" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Widget" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "dashboardId" VARCHAR(36) NOT NULL,
    "node" JSONB NOT NULL,
    "nodeId" VARCHAR(50) NOT NULL,
    "widgetData" JSONB NOT NULL,
    "widgetType" "WidgetType" NOT NULL,
    "shiftData" BOOLEAN,
    "topicId" VARCHAR(36) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Widget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardDevice" (
    "deviceId" VARCHAR(36) NOT NULL,
    "dashboardId" VARCHAR(36) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardDevice_pkey" PRIMARY KEY ("deviceId","dashboardId")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "deviceTypeId" VARCHAR(36) NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceType" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "deviceId" VARCHAR(36) NOT NULL,
    "widgetType" "WidgetType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicEvent" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "topicId" VARCHAR(36) NOT NULL,
    "eventExpression" TEXT,
    "notificationEmailId" TEXT[],
    "bodyEmail" TEXT,
    "htmlBodyEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dashboard_name_key" ON "Dashboard"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Widget_name_key" ON "Widget"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Device_name_key" ON "Device"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceType_name_key" ON "DeviceType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TopicEvent_name_key" ON "TopicEvent"("name");

-- AddForeignKey
ALTER TABLE "Widget" ADD CONSTRAINT "Widget_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Widget" ADD CONSTRAINT "Widget_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardDevice" ADD CONSTRAINT "DashboardDevice_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardDevice" ADD CONSTRAINT "DashboardDevice_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_deviceTypeId_fkey" FOREIGN KEY ("deviceTypeId") REFERENCES "DeviceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicEvent" ADD CONSTRAINT "TopicEvent_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
