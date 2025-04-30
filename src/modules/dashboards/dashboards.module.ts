import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import appConstant from '@/config/app.config';
import { DashboardController } from './infrastructure/dashboard.controller';
import PrismaService from '@/core/base/frameworks/data-services/prisma/prisma.service';
import { DashboardUseCase } from './domain/usecase/dashboard.usecase';
import { DashboardRepository } from './data/dashboard.repository';

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
  controllers: [DashboardController],
  providers: [PrismaService, DashboardUseCase, DashboardRepository],
  exports: [DashboardRepository],
})
export class DashboardModule {}
