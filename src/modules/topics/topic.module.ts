import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import appConstant from '@/config/app.config';
import { TopicController } from './infrastructure/topic.controller';
import PrismaService from '@/core/base/frameworks/data-services/prisma/prisma.service';
import { TopicUseCase } from './domain/usecase/topic.usecase';
import { TopicRepository } from './data/topic.repository';
import { TopicControllerNATS } from './infrastructure/topic-nats.controller';
import { TopicUseCaseNATS } from './domain/usecase/topic-nats.usecase';
import { NatsService } from '@/core/base/frameworks/data-services/nats/nats.service';

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
  controllers: [TopicController, TopicControllerNATS],
  providers: [
    PrismaService,
    TopicUseCase,
    TopicUseCaseNATS,
    TopicRepository,
    NatsService,
  ],
  exports: [TopicRepository],
})
export class TopicModule {}
