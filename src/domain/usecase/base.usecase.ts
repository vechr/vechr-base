import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { OtelMethodCounter, Span } from 'nestjs-otel';
import { log } from '../../frameworks/shared/utils/log.util';
import { IContext } from '../../frameworks/shared/interceptors/context.interceptor';
import {
  EErrorCommonCode,
  UnknownException,
} from '../../frameworks/shared/exceptions/common.exception';
import {
  DropdownEntity,
  IListCursorResult,
  IListPaginationResult,
} from '../entities';
import { PrismaService } from '../../frameworks/data-services/prisma/prisma.service';
import { BaseRepository } from '../../data/base.repository';
import { Prisma } from '@prisma/client';
import { Audit, AuditList } from '../entities/audit.entity';
import { TraceService } from 'nestjs-otel';

/**
 * ## BaseUsecase
 * Collection of CRUD usecase
 * - listDropdown
 * - upsert
 * - create
 * - getById
 * - update
 * - deleteBatch
 * - delete
 * - list pagination
 * - list cursor
 */
export abstract class BaseUseCase<
  Entity extends Record<string, any> = object,
  Include extends Record<string, any> = object,
  Select extends Record<string, any> = object,
  Where extends Record<string, any> = object,
  Create extends Record<string, any> = object,
  CreateMany extends Record<string, any> = object,
  Update extends Record<string, any> = object,
> {
  constructor(
    protected readonly repository: BaseRepository<
      Entity,
      Include,
      Select,
      Where,
      Create,
      CreateMany,
      Update
    >,
    protected db: PrismaService,
    protected readonly traceService: TraceService,
  ) {}

  @OtelMethodCounter()
  @Span('listDropdown usecase')
  async listDropdown(ctx: IContext): Promise<DropdownEntity<string, string>[]> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        span?.addEvent('call the repository of listdropdown');
        return (await this.repository.listDropdown(ctx, tx)).map((val) => ({
          label: val.name,
          value: val.id,
        }));
      });

      span?.setStatus({ code: 1, message: 'usecase finish!' });
      return result;
    } catch (error: any) {
      span?.setStatus({ code: 2, message: error.message });
      if (error instanceof PrismaClientKnownRequestError) {
        log.error(error.message);
        throw new UnknownException({
          code: EErrorCommonCode.INTERNAL_SERVER_ERROR,
          message: `Error unexpected during retrieve a simple list!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('upsert usecase')
  async upsert(
    ctx: IContext,
    body: any,
    include?: Include,
    select?: Select,
    where?: Where,
  ): Promise<Entity> {
    const span = this.traceService.getSpan();
    try {
      const create: Create = body;
      const update: Update = body;

      const result = await this.db.$transaction(async (tx) => {
        span?.addEvent('call the repository of upsert');

        return await this.repository.upsert(
          true,
          ctx,
          body.name,
          tx,
          create,
          update,
          include,
          select,
          where,
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
          message: `Error unexpected during upsert the data!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('create usecase')
  async create(ctx: IContext, body: any, include?: Include): Promise<Entity> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        span?.addEvent('call the repository of create');
        return await this.repository.create(true, ctx, body, tx, include);
      });

      span?.setStatus({ code: 1, message: 'usecase finish!' });
      return result;
    } catch (error: any) {
      span?.setStatus({ code: 2, message: error.message });
      if (error instanceof PrismaClientKnownRequestError) {
        log.error(error.message);
        throw new UnknownException({
          code: EErrorCommonCode.INTERNAL_SERVER_ERROR,
          message: `Error unexpected during create the data!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('getById usecase')
  async getById(
    _ctx: IContext,
    id: string,
    include?: Include,
  ): Promise<Entity> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        span?.addEvent('call the repository of get');
        return await this.repository.getById(id, tx, include);
      });

      span?.setStatus({ code: 1, message: 'usecase finish!' });
      return result;
    } catch (error: any) {
      span?.setStatus({ code: 2, message: error.message });
      if (error instanceof PrismaClientKnownRequestError) {
        log.error(error.message);
        throw new UnknownException({
          code: EErrorCommonCode.INTERNAL_SERVER_ERROR,
          message: `Error unexpected during retrieve the information!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('update usecase')
  async update(ctx: IContext, id: string, body: any): Promise<Entity> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        span?.addEvent('call the repository of update');
        return await this.repository.update(true, ctx, id, body, tx);
      });

      span?.setStatus({ code: 1, message: 'usecase finish!' });
      return result;
    } catch (error: any) {
      span?.setStatus({ code: 2, message: error.message });
      if (error instanceof PrismaClientKnownRequestError) {
        log.error(error.message);
        throw new UnknownException({
          code: EErrorCommonCode.INTERNAL_SERVER_ERROR,
          message: `Error unexpected during change the data!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('deleteBatch usecase')
  async deleteBatch(
    _ctx: IContext,
    body: { ids: string[] },
  ): Promise<Prisma.BatchPayload> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        span?.addEvent('call the repository of delete batch');
        return await this.repository.deleteBatch(body.ids, tx);
      });

      span?.setStatus({ code: 1, message: 'usecase finish!' });
      return result;
    } catch (error: any) {
      span?.setStatus({ code: 2, message: error.message });
      if (error instanceof PrismaClientKnownRequestError) {
        log.error(error.message);
        throw new UnknownException({
          code: EErrorCommonCode.INTERNAL_SERVER_ERROR,
          message: `Error unexpected during delete the datas!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('delete usecase')
  async delete(
    ctx: IContext,
    id: string,
    include?: Include,
    select?: Select,
    where?: Where,
  ): Promise<Entity> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        span?.addEvent('call the repository of get by id');
        await this.repository.getById(id, tx);

        span?.addEvent('call the repository of delete');
        return await this.repository.delete(
          true,
          ctx,
          id,
          tx,
          include,
          select,
          where,
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
          message: `Error unexpected during delete the data!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }

  @OtelMethodCounter()
  @Span('listPagination usecase')
  async listPagination(
    ctx: IContext,
    where?: Where,
  ): Promise<IListPaginationResult<Entity>> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        span?.addEvent('call the repository of list pagination');
        return await this.repository.listPagination(ctx, tx, where);
      });

      span?.setStatus({ code: 1, message: 'usecase finish!' });
      return result;
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
  @Span('listCursor usecase')
  async listCursor(
    ctx: IContext,
    include?: Include,
    where?: Where,
  ): Promise<IListCursorResult<Entity>> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        span?.addEvent('call the repository of list cursor');
        return this.repository.listCursor(ctx, tx, include, where);
      });

      span?.setStatus({ code: 1, message: 'usecase finish!' });
      return result;
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
  @Span('getAudits usecase')
  async getAudits(ctx: IContext): Promise<IListPaginationResult<AuditList>> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        span?.addEvent('call the repository of list audit');
        return this.repository.getAudits(ctx, tx);
      });

      span?.setStatus({ code: 1, message: 'usecase finish!' });
      return result;
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
  @Span('getAudit usecase')
  async getAudit(id: string): Promise<Audit | null> {
    const span = this.traceService.getSpan();
    try {
      const result = await this.db.$transaction(async (tx) => {
        span?.addEvent('call the repository of audit');
        return this.repository.getAudit(tx, id);
      });

      span?.setStatus({ code: 1, message: 'usecase finish!' });
      return result;
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
}
