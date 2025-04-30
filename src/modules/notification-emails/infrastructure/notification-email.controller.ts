import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationEmailUseCase } from '../domain/usecase/notification-email.usecase';
import {
  CreateNotificationEmailSerializer,
  DeleteNotificationEmailSerializer,
  GetNotificationEmailSerializer,
  ListNotificationEmailSerializer,
  UpdateNotificationEmailSerializer,
  UpsertNotificationEmailSerializer,
} from '@/modules/notification-emails/domain/entities/notification-email.serializer';
import {
  CreateNotificationEmailValidator,
  DeleteNotificationEmailBatchBodyValidator,
  FilterCursorNotificationEmailQueryValidator,
  FilterPaginationNotificationEmailQueryValidator,
  ListCursorNotificationEmailQueryValidator,
  ListPaginationNotificationEmailQueryValidator,
  UpdateNotificationEmailValidator,
  UpsertNotificationEmailValidator,
} from '@/modules/notification-emails/domain/entities/notification-email.validator';
import { ControllerFactory } from '@/core/base/infrastructure/factory.controller';
import { OtelInstanceCounter } from 'nestjs-otel';

@ApiTags('NotificationEmail')
@OtelInstanceCounter()
@Controller('notification-email')
export class NotificationEmailController extends ControllerFactory<
  UpsertNotificationEmailValidator,
  CreateNotificationEmailValidator,
  UpdateNotificationEmailValidator,
  DeleteNotificationEmailBatchBodyValidator
>(
  'notification-email',
  'notification-email',
  FilterPaginationNotificationEmailQueryValidator,
  FilterCursorNotificationEmailQueryValidator,
  ListNotificationEmailSerializer,
  ListPaginationNotificationEmailQueryValidator,
  ListCursorNotificationEmailQueryValidator,
  UpsertNotificationEmailSerializer,
  UpsertNotificationEmailValidator,
  CreateNotificationEmailSerializer,
  CreateNotificationEmailValidator,
  GetNotificationEmailSerializer,
  UpdateNotificationEmailSerializer,
  UpdateNotificationEmailValidator,
  DeleteNotificationEmailSerializer,
  DeleteNotificationEmailBatchBodyValidator,
) {
  constructor(public _usecase: NotificationEmailUseCase) {
    super();
  }
}
