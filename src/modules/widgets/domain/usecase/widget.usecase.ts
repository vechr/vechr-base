import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../../core/base/domain/usecase/base.usecase';
import {
  TCreateWidgetRequestBody,
  TUpdateWidgetRequestBody,
  TUpsertWidgetRequestBody,
  Widget,
} from '../entities/widget.entity';
import { Prisma } from '@prisma/client';
import { WidgetRepository } from '../../data/widget.repository';
import PrismaService from '@/core/base/frameworks/data-services/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import log from '@/core/base/frameworks/shared/utils/log.util';
import {
  EErrorCommonCode,
  UnknownException,
} from '@/core/base/frameworks/shared/exceptions/common.exception';
import { OtelMethodCounter, Span, TraceService } from 'nestjs-otel';
import { IContext } from '@/core/base/frameworks/shared/interceptors/context.interceptor';

@Injectable()
export class WidgetUseCase extends BaseUseCase<
  Widget,
  Prisma.WidgetInclude,
  Prisma.WidgetSelect,
  Prisma.WidgetWhereInput | Prisma.WidgetWhereUniqueInput,
  Prisma.XOR<Prisma.WidgetCreateInput, Prisma.WidgetUncheckedCreateInput>,
  Prisma.WidgetCreateManyInput[] | Prisma.WidgetCreateManyInput,
  Prisma.XOR<Prisma.WidgetUpdateInput, Prisma.WidgetUncheckedUpdateInput>
> {
  constructor(
    protected repository: WidgetRepository,
    db: PrismaService,
    traceService: TraceService,
  ) {
    super(repository, db, traceService);
  }

  @OtelMethodCounter()
  @Span('usecase get all widget by dashboard id')
  async getAllWidgetByDashboardId(dashboardId: string): Promise<Widget[]> {
    const span = this.traceService.getSpan();

    try {
      return await this.db.$transaction(async (tx) => {
        span?.addEvent('call the repository of getMany');

        const result = await this.repository.getMany(tx, undefined, undefined, {
          dashboardId,
        });

        span?.setStatus({ code: 1, message: 'usecase finish!' });
        return result;
      });
    } catch (error: any) {
      if (error instanceof PrismaClientKnownRequestError) {
        span?.setStatus({ code: 2, message: error.message });
        log.error(error.message);
        throw new UnknownException({
          code: EErrorCommonCode.INTERNAL_SERVER_ERROR,
          message: `Error unexpected during retrieve a list!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('usecase upsert widget')
  override async upsert(
    ctx: IContext,
    body: TUpsertWidgetRequestBody,
  ): Promise<Widget> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        const create: Prisma.WidgetCreateInput = {
          description: body.description,
          name: body.name,
          node: body.node,
          nodeId: body.nodeId,
          widgetData: body.widgetData,
          dashboard: {
            connect: { id: body.dashboardId },
          },
          topic: {
            connect: { id: body.topicId },
          },
          widgetType: body.widgetType,
          shiftData: body.shiftData,
        };

        const update: Prisma.WidgetUpdateInput = {
          description: body.description,
          name: body.name,
          node: body.node,
          nodeId: body.nodeId,
          widgetData: body.widgetData,
          dashboard: {
            connect: { id: body.dashboardId },
          },
          topic: {
            connect: { id: body.topicId },
          },
          widgetType: body.widgetType,
          shiftData: body.shiftData,
        };

        span?.addEvent('store the widget data');
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
          message: `Error unexpected during create a widget!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('usecase create widget')
  override async create(
    ctx: IContext,
    body: TCreateWidgetRequestBody,
  ): Promise<Widget> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        span?.addEvent('create body widget');
        const bodyModified: Prisma.WidgetCreateInput = {
          description: body.description,
          name: body.name,
          node: body.node,
          nodeId: body.nodeId,
          widgetData: body.widgetData,
          dashboard: {
            connect: { id: body.dashboardId },
          },
          topic: {
            connect: { id: body.topicId },
          },
          widgetType: body.widgetType,
          shiftData: body.shiftData,
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
          message: `Error unexpected during create a widget!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('usecase update widget')
  override async update(
    ctx: IContext,
    id: string,
    body: TUpdateWidgetRequestBody,
  ): Promise<Widget> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        await this.repository.getById(id, tx);

        const bodyModified: Prisma.WidgetUpdateInput = {
          description: body.description,
          name: body.name,
          node: body.node,
          nodeId: body.nodeId,
          widgetData: body.widgetData,
          dashboard: {
            connect: { id: body.dashboardId },
          },
          topic: {
            connect: { id: body.topicId },
          },
          widgetType: body.widgetType,
          shiftData: body.shiftData,
        };

        span?.addEvent('store the widgets data');
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
          message: `Error unexpected during change a widget!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }
}
