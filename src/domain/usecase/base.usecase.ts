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

  /**
   * This TypeScript function asynchronously retrieves a list of dropdown options from a repository,
   * maps them to label-value pairs, and handles errors accordingly.
   * @param {IContext} ctx - The `ctx` parameter in the `listDropdown` function likely represents the
   * context object that contains information or settings needed for the operation. It is of type
   * `IContext`, which suggests that it may be an interface defining the structure of the context
   * object. The context object could include data relevant to the
   * @returns The `listDropdown` function returns a Promise that resolves to an array of
   * `DropdownEntity` objects, where each object has a `label` property representing the name of the
   * dropdown option and a `value` property representing the id of the dropdown option.
   */
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

  /**
   * This TypeScript function performs an upsert operation on an entity using a transaction and handles
   * errors accordingly.
   * @param {IContext} ctx - The `ctx` parameter in the `upsert` function stands for the context
   * object. It is of type `IContext` and is typically used to pass contextual information or settings
   * to the function. This context object may contain information such as user authentication details,
   * request metadata, database connections, or any
   * @param {any} body - The `body` parameter in the `upsert` function represents the data that you
   * want to upsert into the database. It can contain both the data for creating a new entity
   * (`create`) and the data for updating an existing entity (`update`). The function will attempt to
   * either create a new entity
   * @param {Include} [include] - The `include` parameter in the `upsert` function is used to specify
   * which related entities should be included in the result. It allows you to fetch data from related
   * tables along with the main entity being upserted. This can help reduce the number of queries
   * needed to fetch related data separately.
   * @param {Select} [select] - The `select` parameter in the `upsert` function is used to specify
   * which fields of the entity you want to retrieve after the upsert operation is completed. It allows
   * you to control the shape of the data returned from the database. By providing a `select`
   * parameter, you can choose to
   * @param {Where} [where] - The `where` parameter in the `upsert` function is used to specify the
   * conditions that must be met for the operation to be performed. It is typically used to determine
   * which records should be updated or inserted based on certain criteria. The `where` parameter
   * allows you to filter the data before performing
   * @returns The `upsert` method is returning a Promise that resolves to an `Entity`.
   */
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

  /**
   * This TypeScript function creates an entity by calling a repository method within a transaction,
   * handling errors and tracing the operation.
   * @param {IContext} ctx - The `ctx` parameter is of type `IContext`, which likely contains
   * contextual information or settings needed for the operation. It could include things like user
   * authentication details, request metadata, or other relevant information for the operation being
   * performed.
   * @param {any} body - The `body` parameter in the `create` function represents the data that you
   * want to create in the database. It typically contains the information or fields required to create
   * a new entity or record in the database. This data could include attributes such as name, age,
   * email, etc., depending on the
   * @param {Include} [include] - The `include` parameter in the `create` function is an optional
   * parameter of type `Include`. It is used to specify which related entities should be included in
   * the result when creating a new entity. This parameter allows you to fetch related data along with
   * the main entity being created. If specified, the
   * @returns The `create` method is returning a Promise that resolves to an `Entity` object.
   */
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

  /**
   * This function asynchronously retrieves an entity by its ID, handling errors and logging
   * appropriately.
   * @param {IContext} _ctx - The `_ctx` parameter in the `getById` function likely represents the
   * context or environment in which the function is being called. It could contain information or
   * resources that the function may need to access or interact with during its execution. This context
   * could include things like user authentication details, request information, configuration
   * @param {string} id - The `id` parameter in the `getById` function represents the unique identifier
   * of the entity that you want to retrieve from the database. It is typically a string value that
   * uniquely identifies the entity you are querying for.
   * @param {Include} [include] - The `include` parameter in the `getById` function is an optional
   * parameter that specifies what related entities to include in the query result. It allows you to
   * fetch related data along with the main entity being retrieved. This can help reduce the number of
   * database queries needed to fetch all the required data.
   * @returns The `getById` function is returning a Promise that resolves to an `Entity` object.
   */
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

  /**
   * This TypeScript function updates an entity in a database transaction, handling errors and tracing
   * the operation.
   * @param {IContext} ctx - The `ctx` parameter in the `update` function likely stands for the context
   * object that is being passed to the function. This context object may contain information or data
   * that is relevant for the operation being performed in the `update` function. It is commonly used
   * to pass contextual information such as user authentication
   * @param {string} id - The `id` parameter in the `update` function represents the unique identifier
   * of the entity that you want to update in the database. It is typically a string value that
   * uniquely identifies the entity within the database. When calling the `update` function, you need
   * to provide the `id` of the
   * @param {any} body - The `body` parameter in the `update` function represents the data that you
   * want to update for a specific entity. It could include any fields or properties that you want to
   * change or modify in the entity identified by the `id` parameter. This data is typically provided
   * in the form of an object
   * @returns The `update` method is returning a Promise that resolves to an `Entity` object.
   */
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

  /**
   * This function deletes a batch of data using Prisma in a TypeScript application, handling errors
   * and logging appropriately.
   * @param {IContext} _ctx - The `_ctx` parameter in the `deleteBatch` function likely represents the
   * context or environment in which the function is being executed. It could contain information such
   * as user authentication details, request metadata, or any other contextual information needed for
   * the operation. This context is typically provided by the calling code or framework
   * @param body - The `body` parameter in the `deleteBatch` function is an object with a property
   * `ids` which is an array of string values. This array contains the IDs of the items that need to be
   * deleted in a batch operation.
   * @returns The `deleteBatch` function is returning a Promise that resolves to a
   * `Prisma.BatchPayload` object.
   */
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

  /**
   * This TypeScript function deletes an entity by ID while handling errors and logging events.
   * @param {IContext} ctx - The `ctx` parameter in the `delete` function stands for the context
   * object, which typically contains information about the current request or operation. It is
   * commonly used to pass along important data such as user authentication details, request headers,
   * and other contextual information needed for processing the delete operation.
   * @param {string} id - The `id` parameter in the `delete` function represents the unique identifier
   * of the entity that you want to delete from the database. It is typically a string value that
   * uniquely identifies the entity you wish to remove.
   * @param {Include} [include] - The `include` parameter in the `delete` method is used to specify
   * which related entities should be included in the deletion operation. By passing the `include`
   * parameter, you can instruct the method to also delete related entities along with the main entity
   * being deleted. This can help maintain data integrity and ensure
   * @param {Select} [select] - The `select` parameter in the `delete` method allows you to specify
   * which fields of the entity you want to include in the result after the deletion operation. By
   * providing a `select` parameter, you can control the shape of the returned entity object and
   * include only the necessary fields. This can be
   * @param {Where} [where] - The `where` parameter in the `delete` method is used to specify the
   * conditions that must be met for the deletion operation to be performed. It allows you to filter
   * the entities that you want to delete based on certain criteria. This can be useful when you only
   * want to delete specific entities that match
   * @returns The `delete` method is returning a Promise that resolves to an `Entity`.
   */
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

  /**
   * This TypeScript function handles pagination for listing entities, including error handling and
   * logging.
   * @param {IContext} ctx - The `ctx` parameter in the `listPagination` function likely stands for the
   * context object that is being passed to the function. This context object may contain information
   * or settings that are relevant to the operation being performed within the function. It is commonly
   * used to pass data or configurations that are needed for the
   * @param {Where} [where] - The `where` parameter in the `listPagination` function is used to specify
   * conditions for filtering the list of entities that will be paginated. It is an optional parameter,
   * meaning you can choose to provide filtering criteria or leave it empty to retrieve all entities
   * without any specific conditions.
   * @returns The `listPagination` function is returning a Promise that resolves to an
   * `IListPaginationResult<Entity>` object.
   */
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

  /**
   * This TypeScript function asynchronously retrieves a list cursor result from a repository, handling
   * errors and tracing the operation.
   * @param {IContext} ctx - The `ctx` parameter is of type `IContext` and is used to provide context
   * information for the operation. It may contain data such as user information, request details, or
   * any other relevant context needed for the operation.
   * @param {Include} [include] - The `include` parameter in the `listCursor` function is used to
   * specify any related entities that should be included in the query result. It allows you to fetch
   * data from related tables or entities in a single query to avoid additional database calls for each
   * related entity. This can help optimize performance by reducing
   * @param {Where} [where] - The `where` parameter in the `listCursor` function is used to specify the
   * conditions that the entities must meet in order to be included in the result. It is typically used
   * for filtering the entities based on certain criteria. This parameter allows you to retrieve a
   * subset of entities that match the specified conditions
   * @returns The `listCursor` function is returning a Promise that resolves to an
   * `IListCursorResult<Entity>` object.
   */
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

  /**
   * This TypeScript function retrieves a list of audits from a repository using a transaction and
   * handles errors accordingly.
   * @param {IContext} ctx - The `ctx` parameter in the `getAudits` function likely stands for the
   * context object that is being passed to the function. This context object may contain information
   * or settings that are needed for the function to execute properly. It could include things like
   * user authentication details, request parameters, database connections,
   * @returns The `getAudits` function is returning a Promise that resolves to an
   * `IListPaginationResult<AuditList>` object.
   */
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
  /**
   * This TypeScript function retrieves an audit record from a database transaction, handling errors
   * and logging appropriately.
   * @param {string} id - The `id` parameter in the `getAudit` function is a string that represents the
   * unique identifier of the audit record that you want to retrieve from the database.
   * @returns The `getAudit` function is returning a `Promise` that resolves to either an `Audit`
   * object or `null`.
   */
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
