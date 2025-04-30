import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../../core/base/domain/usecase/base.usecase';
import {
  Dashboard,
  TCreateDashboardRequestBody,
  TUpdateDashboardRequestBody,
  TUpsertDashboardRequestBody,
} from '../entities/dashboard.entity';
import { Prisma } from '@prisma/client';
import { DashboardRepository } from '../../data/dashboard.repository';
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
export class DashboardUseCase extends BaseUseCase<
  Dashboard,
  Prisma.DashboardInclude,
  Prisma.DashboardSelect,
  Prisma.DashboardWhereInput | Prisma.DashboardWhereUniqueInput,
  Prisma.XOR<Prisma.DashboardCreateInput, Prisma.DashboardUncheckedCreateInput>,
  Prisma.DashboardCreateManyInput[] | Prisma.DashboardCreateManyInput,
  Prisma.XOR<Prisma.DashboardUpdateInput, Prisma.DashboardUncheckedUpdateInput>
> {
  constructor(
    protected repository: DashboardRepository,
    db: PrismaService,
    traceService: TraceService,
  ) {
    super(repository, db, traceService);
  }

  @OtelMethodCounter()
  @Span('usecase get all dashboard with details')
  async getAllDashboardWithDetails(): Promise<Dashboard[]> {
    const span = this.traceService.getSpan();
    try {
      return await this.db.$transaction(async (tx) => {
        span?.addEvent('call the repository of getMany');

        const result = await this.repository.getMany(tx, {
          devices: {
            include: {
              device: {
                include: {
                  deviceType: true,
                  topics: {
                    include: {
                      topicEvents: true,
                    },
                  },
                },
              },
            },
          },
        });

        span?.setStatus({ code: 1, message: 'usecase finish!' });
        return result;
      });
    } catch (error: any) {
      span?.setStatus({ code: 2, message: error.message });
      if (error instanceof PrismaClientKnownRequestError) {
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
  @Span('usecase upsert dashboard')
  override async upsert(
    ctx: IContext,
    body: TUpsertDashboardRequestBody,
  ): Promise<Dashboard> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        const create: Prisma.DashboardCreateInput = {
          description: body.description,
          name: body.name,
          devices: {
            create: body.devices.map((device) => ({
              device: { connect: { id: device } },
            })),
          },
        };

        const update: Prisma.DashboardUpdateInput = {
          description: body.description,
          name: body.name,
          devices: {
            deleteMany: {},
            create: body.devices.map((device) => ({
              device: { connect: { id: device } },
            })),
          },
        };

        span?.addEvent('store the dashboard data');
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
          message: `Error unexpected during create a dashboard!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('usecase create dashboard')
  override async create(
    ctx: IContext,
    body: TCreateDashboardRequestBody,
  ): Promise<Dashboard> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        span?.addEvent('create body dashboard');
        const bodyModified: Prisma.DashboardCreateInput = {
          description: body.description,
          name: body.name,
          devices: {
            create: body.devices.map((device) => ({
              device: { connect: { id: device } },
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
          message: `Error unexpected during create a dashboard!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('usecase update dashboard')
  override async update(
    ctx: IContext,
    id: string,
    body: TUpdateDashboardRequestBody,
  ): Promise<Dashboard> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        await this.repository.getById(id, tx);

        const bodyModified: Prisma.DashboardUpdateInput = {
          description: body.description,
          name: body.name,
          devices: {
            deleteMany: {},
            create: body.devices?.map((device) => ({
              device: { connect: { id: device } },
            })),
          },
        };

        span?.addEvent('store the dashboards data');
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
          message: `Error unexpected during change a dashboard!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }
}
