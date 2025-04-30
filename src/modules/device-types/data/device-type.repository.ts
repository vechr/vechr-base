import { BaseRepository } from '@/core/base/data/base.repository';
import { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { DeviceType } from '../domain/entities/device-type.entity';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

export class DeviceTypeRepository extends BaseRepository<
  DeviceType,
  Prisma.DeviceTypeInclude,
  Prisma.DeviceTypeSelect,
  Prisma.DeviceTypeWhereInput | Prisma.DeviceTypeWhereUniqueInput,
  Prisma.XOR<
    Prisma.DeviceTypeCreateInput,
    Prisma.DeviceTypeUncheckedCreateInput
  >,
  Prisma.DeviceTypeCreateManyInput[] | Prisma.DeviceTypeCreateManyArgs,
  Prisma.XOR<
    Prisma.DeviceTypeUpdateInput,
    Prisma.DeviceTypeUncheckedUpdateInput
  >
> {
  constructor(@Inject(CACHE_MANAGER) cacheManager: Cache) {
    super(DeviceType, cacheManager);

    this.defaultInclude = {
      devices: true,
    };
  }
}
