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
import { Transport } from '@nestjs/microservices';
import { ClientsModule } from '@nestjs/microservices';
import baseConfig from '@/config/base.config';
import { JwtService } from '@nestjs/jwt';
import 'reflect-metadata';
import { ControlRegistrationService } from './domain/usecases/services/control-registration.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: baseConfig.nats.service,
        transport: Transport.NATS,
        options: {
          servers: [baseConfig.nats.url],
          maxReconnectAttempts: 10,
          tls: {
            caFile: baseConfig.nats.ca,
            keyFile: baseConfig.nats.key,
            certFile: baseConfig.nats.cert,
          },
        },
      },
    ]),
    HealthModule,
  ],
  controllers: [SystemControlController, SystemMonitorController],
  providers: [
    SystemControlHandler,
    SystemMonitorHandler,
    HandlerRegistryService,
    JwtService,
    ConfigRegistryService,
    {
      provide: MESSAGING_ADAPTER,
      useClass: NatsMessagingAdapter,
    },
    ControlRegistrationService,
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
