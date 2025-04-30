import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../../core/base/domain/usecase/base.usecase';
import {
  Device,
  TCreateDeviceRequestBody,
  TUpdateDeviceRequestBody,
  TUpsertDeviceRequestBody,
} from '../entities/device.entity';
import { Prisma } from '@prisma/client';
import { DeviceRepository } from '../../data/device.repository';
import PrismaService from '@/core/base/frameworks/data-services/prisma/prisma.service';
import { OtelMethodCounter, Span, TraceService } from 'nestjs-otel';
import { IContext } from '@/core/base/frameworks/shared/interceptors/context.interceptor';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import log from '@/core/base/frameworks/shared/utils/log.util';
import {
  EErrorCommonCode,
  UnknownException,
} from '@/core/base/frameworks/shared/exceptions/common.exception';

@Injectable()
export class DeviceUseCase extends BaseUseCase<
  Device,
  Prisma.DeviceInclude,
  Prisma.DeviceSelect,
  Prisma.DeviceWhereInput | Prisma.DeviceWhereUniqueInput,
  Prisma.XOR<Prisma.DeviceCreateInput, Prisma.DeviceUncheckedCreateInput>,
  Prisma.DeviceCreateManyInput[] | Prisma.DeviceCreateManyInput,
  Prisma.XOR<Prisma.DeviceUpdateInput, Prisma.DeviceUncheckedUpdateInput>
> {
  constructor(
    protected repository: DeviceRepository,
    db: PrismaService,
    traceService: TraceService,
  ) {
    super(repository, db, traceService);
  }

  @OtelMethodCounter()
  @Span('usecase upsert device')
  override async upsert(
    ctx: IContext,
    body: TUpsertDeviceRequestBody,
  ): Promise<Device> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        const create: Prisma.DeviceCreateInput = {
          description: body.description,
          name: body.name,
          deviceType: {
            connect: { id: body.deviceTypeId },
          },
          isActive: body.isActive,
        };

        const update: Prisma.DeviceUpdateInput = {
          description: body.description,
          name: body.name,
          deviceType: {
            connect: { id: body.deviceTypeId },
          },
          isActive: body.isActive,
        };

        span?.addEvent('store the device data');
        return await this.repository.upsert(
          true,
          ctx,
          body.name,
          tx,
          create,
          update,
        );
      });

      span?.setStatus({ code: 1, message: 'usecase finish!' });
      return result;
    } catch (error: any) {
      span?.setStatus({ code: 2, message: error.message });
      if (error instanceof PrismaClientKnownRequestError) {
        log.error(error.message);
        throw new UnknownException({
          code: EErrorCommonCode.INTERNAL_SERVER_ERROR,
          message: `Error unexpected during create a device!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('usecase create device')
  override async create(
    ctx: IContext,
    body: TCreateDeviceRequestBody,
  ): Promise<Device> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        span?.addEvent('create body device');
        const bodyModified: Prisma.DeviceCreateInput = {
          description: body.description,
          name: body.name,
          deviceType: {
            connect: { id: body.deviceTypeId },
          },
          isActive: body.isActive,
        };

        span?.addEvent('store the body data');
        return await this.repository.create(true, ctx, bodyModified, tx);
      });

      span?.setStatus({ code: 1, message: 'usecase finish!' });
      return result;
    } catch (error: any) {
      span?.setStatus({ code: 2, message: error.message });
      if (error instanceof PrismaClientKnownRequestError) {
        log.error(error.message);
        throw new UnknownException({
          code: EErrorCommonCode.INTERNAL_SERVER_ERROR,
          message: `Error unexpected during create a device!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('usecase update device')
  override async update(
    ctx: IContext,
    id: string,
    body: TUpdateDeviceRequestBody,
  ): Promise<Device> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        await this.repository.getById(id, tx);

        const bodyModified: Prisma.DeviceUpdateInput = {
          description: body.description,
          name: body.name,
          deviceType: {
            connect: { id: body.deviceTypeId },
          },
          isActive: body.isActive,
        };

        span?.addEvent('store the devices data');
        return await this.repository.update(true, ctx, id, bodyModified, tx);
      });

      span?.setStatus({ code: 1, message: 'usecase finish!' });
      return result;
    } catch (error: any) {
      span?.setStatus({ code: 2, message: error.message });
      if (error instanceof PrismaClientKnownRequestError) {
        log.error(error.message);
        throw new UnknownException({
          code: EErrorCommonCode.INTERNAL_SERVER_ERROR,
          message: `Error unexpected during change a device!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }
}
