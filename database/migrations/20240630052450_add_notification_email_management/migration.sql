/*
  Warnings:

  - You are about to drop the column `notificationEmailId` on the `TopicEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TopicEvent" DROP COLUMN "notificationEmailId";

-- CreateTable
CREATE TABLE "NotificationEmailTopicEvent" (
    "notificationEmailId" VARCHAR(36) NOT NULL,
    "topicEventId" VARCHAR(36) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationEmailTopicEvent_pkey" PRIMARY KEY ("notificationEmailId","topicEventId")
);

-- CreateTable
CREATE TABLE "NotificationEmail" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "sender" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationEmail_name_key" ON "NotificationEmail"("name");

-- AddForeignKey
ALTER TABLE "NotificationEmailTopicEvent" ADD CONSTRAINT "NotificationEmailTopicEvent_notificationEmailId_fkey" FOREIGN KEY ("notificationEmailId") REFERENCES "NotificationEmail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEmailTopicEvent" ADD CONSTRAINT "NotificationEmailTopicEvent_topicEventId_fkey" FOREIGN KEY ("topicEventId") REFERENCES "TopicEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
