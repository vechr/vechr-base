import { $Enums, Prisma, Widget as TWidget } from '@prisma/client';
import { IListRequestQuery } from '@/core/base/domain/entities';
import { BaseEntity } from '@/core/base/domain/entities';

export class Widget extends BaseEntity implements TWidget {
  dashboardId: string;
  node: string;
  nodeId: string;
  widgetData: string;
  widgetType: $Enums.WidgetType;
  shiftData: boolean | null;
  topicId: string;
}

export type OptionalWidget = Partial<Widget>;
export type RequiredWidget = Required<Widget>;
export type TListWidgetRequestQuery<P> = IListRequestQuery<
  P,
  Widget,
  Prisma.WidgetWhereInput
>;
export type TCreateWidgetRequestBody = Omit<
  Widget,
  'id' | 'createdAt' | 'updatedAt'
>;
export type TUpsertWidgetRequestBody = TCreateWidgetRequestBody;
export type TUpdateWidgetRequestBody = Partial<TCreateWidgetRequestBody>;
