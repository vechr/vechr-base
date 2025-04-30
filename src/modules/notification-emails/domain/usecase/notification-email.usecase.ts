import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../../core/base/domain/usecase/base.usecase';
import { NotificationEmail } from '../entities/notification-email.entity';
import { Prisma } from '@prisma/client';
import { NotificationEmailRepository } from '../../data/notification-email.repository';
import PrismaService from '@/core/base/frameworks/data-services/prisma/prisma.service';
import { TraceService } from 'nestjs-otel';

@Injectable()
export class NotificationEmailUseCase extends BaseUseCase<
  NotificationEmail,
  Prisma.NotificationEmailInclude,
  Prisma.NotificationEmailSelect,
  Prisma.NotificationEmailWhereInput | Prisma.NotificationEmailWhereUniqueInput,
  Prisma.XOR<
    Prisma.NotificationEmailCreateInput,
    Prisma.NotificationEmailUncheckedCreateInput
  >,
  | Prisma.NotificationEmailCreateManyInput[]
  | Prisma.NotificationEmailCreateManyInput,
  Prisma.XOR<
    Prisma.NotificationEmailUpdateInput,
    Prisma.NotificationEmailUncheckedUpdateInput
  >
> {
  constructor(
    protected repository: NotificationEmailRepository,
    db: PrismaService,
    traceService: TraceService,
  ) {
    super(repository, db, traceService);
  }
}
