import { Module } from '@nestjs/common';
import { SystemControlController } from './infrastructure/system-control.controller';
import { SystemMonitorController } from './infrastructure/system-monitor.controller';
import { SystemControlHandler } from './domain/usecases/handlers/system-control.handler';
import { SystemMonitorHandler } from './domain/usecases/handlers/system-monitor.handler';
import { HealthModule } from '@/frameworks/health/health.module';
import { NatsMessagingAdapter } from './domain/usecases/adapter/nats-messaging.adapter';
import { MESSAGING_ADAPTER } from './domain/entities/messaging-adapter.interface';
import { Transport } from '@nestjs/microservices';
import { ClientsModule } from '@nestjs/microservices';
import baseConfig from '@/config/base.config';
import { JwtService } from '@nestjs/jwt';
import { MethodCollectorService } from '@/frameworks/data-services/method-collector/method-collector.service';
import { DiscoveryModule, MetadataScanner } from '@nestjs/core';
import { ConfigCollectorService } from '@/frameworks/data-services/config/config-collector.service';

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
    DiscoveryModule,
  ],
  controllers: [SystemControlController, SystemMonitorController],
  providers: [
    SystemControlHandler,
    SystemMonitorHandler,
    JwtService,
    MethodCollectorService,
    ConfigCollectorService,
    MetadataScanner,
    {
      provide: MESSAGING_ADAPTER,
      useClass: NatsMessagingAdapter,
    },
  ],
  exports: [
    SystemControlHandler,
    SystemMonitorHandler,
    MESSAGING_ADAPTER,
    MethodCollectorService,
    ConfigCollectorService,
  ],
})
export class MessagingModule {}
