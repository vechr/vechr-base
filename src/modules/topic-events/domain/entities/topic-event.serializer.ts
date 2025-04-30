import { NotificationEmail } from '@/modules/notification-emails/domain/entities/notification-email.entity';
import { Exclude } from 'class-transformer';
import { TopicEvent } from './topic-event.entity';

export class ListTopicEventSerializer implements TopicEvent {
  topicId: string;
  eventExpression: string | null;
  bodyEmail: string | null;
  htmlBodyEmail: string | null;
  name: string;
  description: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  notificationEmails: NotificationEmail[];
}

export class CreateTopicEventSerializer implements TopicEvent {
  topicId: string;
  eventExpression: string | null;
  bodyEmail: string | null;
  htmlBodyEmail: string | null;
  name: string;
  description: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  notificationEmails: NotificationEmail[];
}
export class UpsertTopicEventSerializer extends CreateTopicEventSerializer {}
export class UpdateTopicEventSerializer extends CreateTopicEventSerializer {}
export class DeleteTopicEventSerializer extends CreateTopicEventSerializer {}
export class GetTopicEventSerializer extends CreateTopicEventSerializer {}
