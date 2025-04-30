import { BaseRepository } from '@/core/base/data/base.repository';
import { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { NotificationEmail } from '../domain/entities/notification-email.entity';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

export class NotificationEmailRepository extends BaseRepository<
  NotificationEmail,
  Prisma.NotificationEmailInclude,
  Prisma.NotificationEmailSelect,
  Prisma.NotificationEmailWhereInput | Prisma.NotificationEmailWhereUniqueInput,
  Prisma.XOR<
    Prisma.NotificationEmailCreateInput,
    Prisma.NotificationEmailUncheckedCreateInput
  >,
  | Prisma.NotificationEmailCreateManyInput[]
  | Prisma.NotificationEmailCreateManyArgs,
  Prisma.XOR<
    Prisma.NotificationEmailUpdateInput,
    Prisma.NotificationEmailUncheckedUpdateInput
  >
> {
  constructor(@Inject(CACHE_MANAGER) cacheManager: Cache) {
    super(NotificationEmail, cacheManager);
  }
}
