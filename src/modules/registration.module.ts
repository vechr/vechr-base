import { Module } from '@nestjs/common';
import { DashboardModule } from './dashboards/dashboards.module';
import DeviceTypeModule from './device-types/device-type.module';
import { DeviceModule } from './devices/device.module';
import { NotificationEmailModule } from './notification-emails/notification-email.module';
import { TopicEventModule } from './topic-events/topic-event.module';
import { TopicModule } from './topics/topic.module';
import { WidgetModule } from './widgets/widget.module';

@Module({
  imports: [
    DashboardModule,
    DeviceTypeModule,
    DeviceModule,
    NotificationEmailModule,
    TopicEventModule,
    TopicModule,
    WidgetModule,
  ],
})
export class RegistrationModule {}
