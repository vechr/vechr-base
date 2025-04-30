import { BaseRepository } from '@/core/base/data/base.repository';
import { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { Device } from '../domain/entities/device.entity';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

export class DeviceRepository extends BaseRepository<
  Device,
  Prisma.DeviceInclude,
  Prisma.DeviceSelect,
  Prisma.DeviceWhereInput | Prisma.DeviceWhereUniqueInput,
  Prisma.XOR<Prisma.DeviceCreateInput, Prisma.DeviceUncheckedCreateInput>,
  Prisma.DeviceCreateManyInput[] | Prisma.DeviceCreateManyArgs,
  Prisma.XOR<Prisma.DeviceUpdateInput, Prisma.DeviceUncheckedUpdateInput>
> {
  constructor(@Inject(CACHE_MANAGER) cacheManager: Cache) {
    super(Device, cacheManager);

    this.defaultInclude = {
      deviceType: true,
      topics: true,
    };
  }
}
