import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import appConstant from '@/config/app.config';
import { WidgetController } from './infrastructure/widget.controller';
import PrismaService from '@/core/base/frameworks/data-services/prisma/prisma.service';
import { WidgetUseCase } from './domain/usecase/widget.usecase';
import { WidgetRepository } from './data/widget.repository';

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
  controllers: [WidgetController],
  providers: [PrismaService, WidgetUseCase, WidgetRepository],
  exports: [WidgetRepository],
})
export class WidgetModule {}
