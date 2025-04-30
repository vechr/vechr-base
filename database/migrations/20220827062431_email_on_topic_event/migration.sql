-- AlterTable
ALTER TABLE "topic_events" ADD COLUMN     "bodyEmail" TEXT,
ADD COLUMN     "htmlBodyEmail" TEXT,
ADD COLUMN     "notificationEmailId" TEXT[];
