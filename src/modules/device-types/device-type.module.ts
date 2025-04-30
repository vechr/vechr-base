import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import appConfig from '@/config/app.config';
import PrismaService from '@/core/base/frameworks/data-services/prisma/prisma.service';
import { DeviceTypeController } from './infrastructure/device-type.controller';
import { DeviceTypeRepository } from './data/device-type.repository';
import { DeviceTypeUseCase } from './domain/usecase/device-type.usecase';

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
  controllers: [DeviceTypeController],
  providers: [PrismaService, DeviceTypeUseCase, DeviceTypeRepository],
  exports: [DeviceTypeRepository],
})
export default class DeviceTypeModule {}
