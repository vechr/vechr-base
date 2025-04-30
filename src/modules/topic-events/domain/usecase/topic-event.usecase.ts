import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../../core/base/domain/usecase/base.usecase';
import {
  TCreateTopicEventRequestBody,
  TUpdateTopicEventRequestBody,
  TUpsertTopicEventRequestBody,
  TopicEvent,
} from '../entities/topic-event.entity';
import { Prisma } from '@prisma/client';
import { TopicEventRepository } from '../../data/topic-event.repository';
import PrismaService from '@/core/base/frameworks/data-services/prisma/prisma.service';
import { OtelMethodCounter, Span, TraceService } from 'nestjs-otel';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import log from '@/core/base/frameworks/shared/utils/log.util';
import {
  EErrorCommonCode,
  UnknownException,
} from '@/core/base/frameworks/shared/exceptions/common.exception';
import { IContext } from '@/core/base/frameworks/shared/interceptors/context.interceptor';

@Injectable()
export class TopicEventUseCase extends BaseUseCase<
  TopicEvent,
  Prisma.TopicEventInclude,
  Prisma.TopicEventSelect,
  Prisma.TopicEventWhereInput | Prisma.TopicEventWhereUniqueInput,
  Prisma.XOR<
    Prisma.TopicEventCreateInput,
    Prisma.TopicEventUncheckedCreateInput
  >,
  Prisma.TopicEventCreateManyInput[] | Prisma.TopicEventCreateManyInput,
  Prisma.XOR<
    Prisma.TopicEventUpdateInput,
    Prisma.TopicEventUncheckedUpdateInput
  >
> {
  constructor(
    protected repository: TopicEventRepository,
    db: PrismaService,
    traceService: TraceService,
  ) {
    super(repository, db, traceService);
  }

  @OtelMethodCounter()
  @Span('usecase upsert topic event')
  override async upsert(
    ctx: IContext,
    body: TUpsertTopicEventRequestBody,
  ): Promise<TopicEvent> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        const create: Prisma.TopicEventCreateInput = {
          description: body.description,
          name: body.name,
          topic: {
            connect: {
              id: body.topicId,
            },
          },
          bodyEmail: body.bodyEmail,
          eventExpression: body.eventExpression,
          htmlBodyEmail: body.htmlBodyEmail,
          notificationEmails: {
            create: body.notificationEmails.map((notifEmail) => ({
              notificationEmail: { connect: { id: notifEmail } },
            })),
          },
        };

        const update: Prisma.TopicEventUpdateInput = {
          description: body.description,
          name: body.name,
          topic: {
            connect: {
              id: body.topicId,
            },
          },
          bodyEmail: body.bodyEmail,
          eventExpression: body.eventExpression,
          htmlBodyEmail: body.htmlBodyEmail,
          notificationEmails: {
            deleteMany: {},
            create: body.notificationEmails.map((notifEmail) => ({
              notificationEmail: { connect: { id: notifEmail } },
            })),
          },
        };

        span?.addEvent('store the topic event data');
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
          message: `Error unexpected during create a topic event!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('usecase create topic event')
  override async create(
    ctx: IContext,
    body: TCreateTopicEventRequestBody,
  ): Promise<TopicEvent> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        span?.addEvent('create body topic event');
        const bodyModified: Prisma.TopicEventCreateInput = {
          description: body.description,
          name: body.name,
          topic: {
            connect: {
              id: body.topicId,
            },
          },
          bodyEmail: body.bodyEmail,
          eventExpression: body.eventExpression,
          htmlBodyEmail: body.htmlBodyEmail,
          notificationEmails: {
            create: body.notificationEmails.map((notifEmail) => ({
              notificationEmail: { connect: { id: notifEmail } },
            })),
          },
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
          message: `Error unexpected during create a topic event!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('usecase update topic event')
  override async update(
    ctx: IContext,
    id: string,
    body: TUpdateTopicEventRequestBody,
  ): Promise<TopicEvent> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        await this.repository.getById(id, tx);

        const bodyModified: Prisma.TopicEventUpdateInput = {
          description: body.description,
          name: body.name,
          topic: {
            connect: {
              id: body.topicId,
            },
          },
          bodyEmail: body.bodyEmail,
          eventExpression: body.eventExpression,
          htmlBodyEmail: body.htmlBodyEmail,
          notificationEmails: {
            deleteMany: {},
            create: body.notificationEmails?.map((notifEmail) => ({
              notificationEmail: { connect: { id: notifEmail } },
            })),
          },
        };

        span?.addEvent('store the topic event data');
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
          message: `Error unexpected during change a topic event!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }
}
