import appConfig from '@/config/app.config';
import PrismaService from '@/core/base/frameworks/data-services/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationEmailRepository } from './data/notification-email.repository';
import { NotificationEmailUseCase } from './domain/usecase/notification-email.usecase';
import { NotificationEmailController } from './infrastructure/notification-email.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: appConfig.NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [appConfig.NATS_URL],
          maxReconnectAttempts: 10,
          tls: {
            caFile: appConfig.NATS_CA,
            keyFile: appConfig.NATS_KEY,
            certFile: appConfig.NATS_CERT,
          },
        },
      },
    ]),
  ],
  controllers: [NotificationEmailController],
  providers: [
    PrismaService,
    NotificationEmailUseCase,
    NotificationEmailRepository,
  ],
  exports: [NotificationEmailRepository],
})
export class NotificationEmailModule {}
