import { BaseRepository } from '@/core/base/data/base.repository';
import { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { Widget } from '../domain/entities/widget.entity';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

export class WidgetRepository extends BaseRepository<
  Widget,
  Prisma.WidgetInclude,
  Prisma.WidgetSelect,
  Prisma.WidgetWhereInput | Prisma.WidgetWhereUniqueInput,
  Prisma.XOR<Prisma.WidgetCreateInput, Prisma.WidgetUncheckedCreateInput>,
  Prisma.WidgetCreateManyInput[] | Prisma.WidgetCreateManyArgs,
  Prisma.XOR<Prisma.WidgetUpdateInput, Prisma.WidgetUncheckedUpdateInput>
> {
  constructor(@Inject(CACHE_MANAGER) cacheManager: Cache) {
    super(Widget, cacheManager);

    this.defaultInclude = {
      dashboard: true,
      topic: true,
    };
  }
}
