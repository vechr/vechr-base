import { BaseRepository } from '@/core/base/data/base.repository';
import { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { Topic } from '../domain/entities/topic.entity';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

export class TopicRepository extends BaseRepository<
  Topic,
  Prisma.TopicInclude,
  Prisma.TopicSelect,
  Prisma.TopicWhereInput | Prisma.TopicWhereUniqueInput,
  Prisma.XOR<Prisma.TopicCreateInput, Prisma.TopicUncheckedCreateInput>,
  Prisma.TopicCreateManyInput[] | Prisma.TopicCreateManyArgs,
  Prisma.XOR<Prisma.TopicUpdateInput, Prisma.TopicUncheckedUpdateInput>
> {
  constructor(@Inject(CACHE_MANAGER) cacheManager: Cache) {
    super(Topic, cacheManager);

    this.defaultInclude = {
      topicEvents: true,
      widgets: true,
    };
  }
}
