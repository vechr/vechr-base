import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import appConstant from '@/config/app.config';
import { TopicEventController } from './infrastructure/topic-event.controller';
import PrismaService from '@/core/base/frameworks/data-services/prisma/prisma.service';
import { TopicEventUseCase } from './domain/usecase/topic-event.usecase';
import { TopicEventRepository } from './data/topic-event.repository';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: appConstant.NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [appConstant.NATS_URL],
          maxReconnectAttempts: 10,
          tls: {
            caFile: appConstant.NATS_CA,
            keyFile: appConstant.NATS_KEY,
            certFile: appConstant.NATS_CERT,
          },
        },
      },
    ]),
  ],
  controllers: [TopicEventController],
  providers: [PrismaService, TopicEventUseCase, TopicEventRepository],
  exports: [TopicEventRepository],
})
export class TopicEventModule {}
