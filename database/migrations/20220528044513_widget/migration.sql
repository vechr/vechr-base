-- CreateEnum
CREATE TYPE "WidgetType" AS ENUM ('BAR', 'BUBBLE', 'DOUGHNUT', 'PIE', 'GAUGE', 'LINE', 'POLAR', 'RADAR', 'SCATTER', 'MAPS');

-- CreateTable
CREATE TABLE "widgets" (
    "id" VARCHAR(36) NOT NULL,
    "dashboardId" VARCHAR(36) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "node" JSONB,
    "widgetData" JSONB,
    "widgetType" "WidgetType" NOT NULL,
    "topicId" VARCHAR(36) NOT NULL,

    CONSTRAINT "widgets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "dashboards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
