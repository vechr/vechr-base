import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../../core/base/domain/usecase/base.usecase';
import {
  TCreateTopicRequestBody,
  TUpdateTopicRequestBody,
  TUpsertTopicRequestBody,
  Topic,
} from '../entities/topic.entity';
import { Prisma } from '@prisma/client';
import { TopicRepository } from '../../data/topic.repository';
import PrismaService from '@/core/base/frameworks/data-services/prisma/prisma.service';
import { OtelMethodCounter, Span, TraceService } from 'nestjs-otel';
import { IContext } from '@/core/base/frameworks/shared/interceptors/context.interceptor';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import log from '@/core/base/frameworks/shared/utils/log.util';
import {
  EErrorCommonCode,
  UnknownException,
} from '@/core/base/frameworks/shared/exceptions/common.exception';

@Injectable()
export class TopicUseCase extends BaseUseCase<
  Topic,
  Prisma.TopicInclude,
  Prisma.TopicSelect,
  Prisma.TopicWhereInput | Prisma.TopicWhereUniqueInput,
  Prisma.XOR<Prisma.TopicCreateInput, Prisma.TopicUncheckedCreateInput>,
  Prisma.TopicCreateManyInput[] | Prisma.TopicCreateManyInput,
  Prisma.XOR<Prisma.TopicUpdateInput, Prisma.TopicUncheckedUpdateInput>
> {
  constructor(
    protected repository: TopicRepository,
    db: PrismaService,
    traceService: TraceService,
  ) {
    super(repository, db, traceService);
  }

  @OtelMethodCounter()
  @Span('usecase create topic')
  override async upsert(
    ctx: IContext,
    body: TUpsertTopicRequestBody,
  ): Promise<Topic> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        const create: Prisma.TopicCreateInput = {
          description: body.description,
          name: body.name,
          device: {
            connect: { id: body.deviceId },
          },
          widgetType: body.widgetType,
        };

        const update: Prisma.TopicUpdateInput = {
          description: body.description,
          name: body.name,
          device: {
            connect: { id: body.deviceId },
          },
          widgetType: body.widgetType,
        };

        span?.addEvent('store the topic data');
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
          message: `Error unexpected during create a topic!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('usecase create topic')
  override async create(
    ctx: IContext,
    body: TCreateTopicRequestBody,
  ): Promise<Topic> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        span?.addEvent('create body topic');
        const bodyModified: Prisma.TopicCreateInput = {
          description: body.description,
          name: body.name,
          device: {
            connect: { id: body.deviceId },
          },
          widgetType: body.widgetType,
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
          message: `Error unexpected during create a topic!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('usecase update topic')
  override async update(
    ctx: IContext,
    id: string,
    body: TUpdateTopicRequestBody,
  ): Promise<Topic> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        await this.repository.getById(id, tx);

        const bodyModified: Prisma.TopicUpdateInput = {
          description: body.description,
          name: body.name,
          device: {
            connect: { id: body.deviceId },
          },
          widgetType: body.widgetType,
        };

        span?.addEvent('store the topics data');
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
          message: `Error unexpected during change a topic!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }
}
