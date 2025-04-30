import { Prisma, TopicEvent as TTopicEvent } from '@prisma/client';
import { IListRequestQuery } from '@/core/base/domain/entities';
import { BaseEntity } from '@/core/base/domain/entities';
import { NotificationEmail } from '@/modules/notification-emails/domain/entities/notification-email.entity';

export class TopicEvent extends BaseEntity implements TTopicEvent {
  topicId: string;
  eventExpression: string | null;
  bodyEmail: string | null;
  htmlBodyEmail: string | null;

  notificationEmails: NotificationEmail[];
}

export type OptionalTopicEvent = Partial<TopicEvent>;
export type RequiredTopicEvent = Required<TopicEvent>;
export type TListTopicEventRequestQuery<P> = IListRequestQuery<
  P,
  TopicEvent,
  Prisma.TopicEventWhereInput
>;
export type TCreateTopicEventRequestBody = Omit<
  TopicEvent,
  'id' | 'createdAt' | 'updatedAt' | 'notificationEmails'
> & {
  notificationEmails: string[];
};
export type TUpsertTopicEventRequestBody = TCreateTopicEventRequestBody;
export type TUpdateTopicEventRequestBody =
  Partial<TCreateTopicEventRequestBody>;
