import { Module } from '@nestjs/common';
import { SystemControlController } from './infrastructure/system-control.controller';
import { SystemMonitorController } from './infrastructure/system-monitor.controller';
import { SystemControlHandler } from './domain/usecases/handlers/system-control.handler';
import { SystemMonitorHandler } from './domain/usecases/handlers/system-monitor.handler';
import { HandlerRegistryService } from './domain/usecases/services/handler-registry.service';
import { HealthModule } from '@/frameworks/health/health.module';
import { ConfigRegistryService } from './domain/usecases/services/config-registry.service';
import { NatsMessagingAdapter } from './domain/usecases/adapter/nats-messaging.adapter';
import { MESSAGING_ADAPTER } from './domain/entities/messaging-adapter.interface';

@Module({
  imports: [HealthModule],
  controllers: [SystemControlController, SystemMonitorController],
  providers: [
    SystemControlHandler,
    SystemMonitorHandler,
    HandlerRegistryService,
    ConfigRegistryService,
    {
      provide: MESSAGING_ADAPTER,
      useClass: NatsMessagingAdapter,
    },
  ],
  exports: [
    SystemControlHandler,
    SystemMonitorHandler,
    HandlerRegistryService,
    ConfigRegistryService,
    MESSAGING_ADAPTER,
  ],
})
export class MessagingModule {}
