import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import appConstant from '@/config/app.config';
import { DeviceController } from './infrastructure/device.controller';
import PrismaService from '@/core/base/frameworks/data-services/prisma/prisma.service';
import { DeviceUseCase } from './domain/usecase/device.usecase';
import { DeviceRepository } from './data/device.repository';

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
  controllers: [DeviceController],
  providers: [PrismaService, DeviceUseCase, DeviceRepository],
  exports: [DeviceRepository],
})
export class DeviceModule {}
