import { BaseRepository } from '@/core/base/data/base.repository';
import { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { TopicEvent } from '../domain/entities/topic-event.entity';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

export class TopicEventRepository extends BaseRepository<
  TopicEvent,
  Prisma.TopicEventInclude,
  Prisma.TopicEventSelect,
  Prisma.TopicEventWhereInput | Prisma.TopicEventWhereUniqueInput,
  Prisma.XOR<
    Prisma.TopicEventCreateInput,
    Prisma.TopicEventUncheckedCreateInput
  >,
  Prisma.TopicEventCreateManyInput[] | Prisma.TopicEventCreateManyArgs,
  Prisma.XOR<
    Prisma.TopicEventUpdateInput,
    Prisma.TopicEventUncheckedUpdateInput
  >
> {
  constructor(@Inject(CACHE_MANAGER) cacheManager: Cache) {
    super(TopicEvent, cacheManager);
  }
}
