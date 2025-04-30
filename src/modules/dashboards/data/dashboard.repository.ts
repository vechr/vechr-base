import { BaseRepository } from '@/core/base/data/base.repository';
import { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { Dashboard } from '../domain/entities/dashboard.entity';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

export class DashboardRepository extends BaseRepository<
  Dashboard,
  Prisma.DashboardInclude,
  Prisma.DashboardSelect,
  Prisma.DashboardWhereInput | Prisma.DashboardWhereUniqueInput,
  Prisma.XOR<Prisma.DashboardCreateInput, Prisma.DashboardUncheckedCreateInput>,
  Prisma.DashboardCreateManyInput[] | Prisma.DashboardCreateManyArgs,
  Prisma.XOR<Prisma.DashboardUpdateInput, Prisma.DashboardUncheckedUpdateInput>
> {
  constructor(@Inject(CACHE_MANAGER) cacheManager: Cache) {
    super(Dashboard, cacheManager);

    this.defaultInclude = {
      devices: {
        include: {
          device: true,
        },
      },
    };
  }
}
