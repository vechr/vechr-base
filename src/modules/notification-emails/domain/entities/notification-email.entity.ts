import {
  Prisma,
  NotificationEmail as TNotificationEmail,
} from '@prisma/client';
import { IListRequestQuery } from '@/core/base/domain/entities';
import { BaseEntity } from '@/core/base/domain/entities';

export class NotificationEmail
  extends BaseEntity
  implements TNotificationEmail
{
  sender: string;
  recipient: string;
}

export type OptionalNotificationEmail = Partial<NotificationEmail>;
export type RequiredNotificationEmail = Required<NotificationEmail>;
export type TListNotificationEmailRequestQuery<P> = IListRequestQuery<
  P,
  NotificationEmail,
  Prisma.NotificationEmailWhereInput
>;
export type TCreateNotificationEmailRequestBody = Omit<
  NotificationEmail,
  'id' | 'createdAt' | 'updatedAt'
>;
export type TUpsertNotificationEmailRequestBody =
  TCreateNotificationEmailRequestBody;
export type TUpdateNotificationEmailRequestBody =
  Partial<TCreateNotificationEmailRequestBody>;
