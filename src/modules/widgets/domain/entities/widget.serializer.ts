import { $Enums } from '@prisma/client';
import { Widget } from './widget.entity';

export class ListWidgetSerializer implements Widget {
  dashboardId: string;
  node: string;
  nodeId: string;
  widgetData: string;
  widgetType: $Enums.WidgetType;
  shiftData: boolean | null;
  topicId: string;
  name: string;
  description: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateWidgetSerializer implements Widget {
  dashboardId: string;
  node: string;
  nodeId: string;
  widgetData: string;
  widgetType: $Enums.WidgetType;
  shiftData: boolean | null;
  topicId: string;
  name: string;
  description: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
export class UpsertWidgetSerializer extends CreateWidgetSerializer {}
export class UpdateWidgetSerializer extends CreateWidgetSerializer {}
export class DeleteWidgetSerializer extends CreateWidgetSerializer {}
export class GetWidgetSerializer extends CreateWidgetSerializer {}
