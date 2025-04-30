import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../../core/base/domain/usecase/base.usecase';
import { DeviceType } from '../entities/device-type.entity';
import { Prisma } from '@prisma/client';
import { DeviceTypeRepository } from '../../data/device-type.repository';
import PrismaService from '@/core/base/frameworks/data-services/prisma/prisma.service';
import { TraceService } from 'nestjs-otel';

@Injectable()
export class DeviceTypeUseCase extends BaseUseCase<
  DeviceType,
  Prisma.DeviceTypeInclude,
  Prisma.DeviceTypeSelect,
  Prisma.DeviceTypeWhereInput | Prisma.DeviceTypeWhereUniqueInput,
  Prisma.XOR<
    Prisma.DeviceTypeCreateInput,
    Prisma.DeviceTypeUncheckedCreateInput
  >,
  Prisma.DeviceTypeCreateManyInput[] | Prisma.DeviceTypeCreateManyInput,
  Prisma.XOR<
    Prisma.DeviceTypeUpdateInput,
    Prisma.DeviceTypeUncheckedUpdateInput
  >
> {
  constructor(
    protected repository: DeviceTypeRepository,
    db: PrismaService,
    traceService: TraceService,
  ) {
    super(repository, db, traceService);
  }
}
