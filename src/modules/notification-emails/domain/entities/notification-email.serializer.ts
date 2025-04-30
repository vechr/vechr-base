import { NotificationEmail } from './notification-email.entity';

export class ListNotificationEmailSerializer implements NotificationEmail {
  sender: string;
  recipient: string;
  name: string;
  description: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateNotificationEmailSerializer implements NotificationEmail {
  sender: string;
  recipient: string;
  name: string;
  description: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
export class UpsertNotificationEmailSerializer extends CreateNotificationEmailSerializer {}
export class UpdateNotificationEmailSerializer extends CreateNotificationEmailSerializer {}
export class DeleteNotificationEmailSerializer extends CreateNotificationEmailSerializer {}
export class GetNotificationEmailSerializer extends CreateNotificationEmailSerializer {}
