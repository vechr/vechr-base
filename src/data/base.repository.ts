import { Cache } from 'cache-manager';
import { IContext } from '../frameworks/shared/interceptors/context.interceptor';
import {
  IListCursorResult,
  IListPaginationResult,
  TPrismaTx,
} from '../domain/entities';
import { camelize } from '../frameworks/shared/utils/string.util';
import { DeleteHelper, ReadHelper, WriteHelper } from './helpers';
import { Prisma } from '@prisma/client';
import { Audit, AuditList } from '../domain/entities/audit.entity';
import { OtelMethodCounter, Span } from 'nestjs-otel';

/**
 * ## BaseRepository
 * Collection of basic CRUD methods
 * - listDropdown
 * - upsert
 * - create
 * - createMany
 * - update
 * - delete
 * - deleteBatch
 * - get
 * - getMany
 * - listCursor
 * - listPagination
 * - getAudits
 * - getAudit
 */
export abstract class BaseRepository<
  Entity extends Record<string, any>,
  Include extends Record<string, any>,
  Select extends Record<string, any>,
  Where extends Record<string, any>,
  Create extends Record<string, any>,
  CreateMany extends Record<string, any>,
  Update extends Record<string, any>,
> {
  protected _entity: string;
  protected cacheManager: Cache;

  public defaultInclude: Include;
  public defaultSelect: Select;
  public defaultWhere: Where;

  constructor(entity: new () => Entity, cacheManager: Cache) {
    this._entity = camelize(entity.name);
    this.cacheManager = cacheManager;
  }

  /**
   * The listDropdown function returns a Promise of an array of objects with 'id' and 'name' properties
   * by calling the listDropDown method from ReadHelper.
   * @param {IContext} ctx - The `ctx` parameter typically stands for the context object, which
   * contains information about the current execution context of the application. It can include things
   * like user authentication details, request information, and other context-specific data needed for
   * the operation.
   * @param {TPrismaTx} tx - The `tx` parameter in the `listDropdown` function likely refers to a
   * transaction object used for database operations. It is of type `TPrismaTx`, which suggests it may
   * be related to handling transactions with a Prisma database.
   * @returns A Promise that resolves to an array of objects with 'id' and 'name' properties from the
   * Entity.
   */
  @OtelMethodCounter()
  @Span('listDropdown')
  async listDropdown(
    ctx: IContext,
    tx: TPrismaTx,
  ): Promise<Pick<Entity, 'id' | 'name'>[]> {
    return ReadHelper.listDropDown<Entity>(ctx, tx, this._entity);
  }

  /**
   * The upsert function in TypeScript asynchronously upserts an entity with optional parameters for
   * auditing, context, name, transaction, create and update data, include and select fields, and where
   * conditions.
   * @param {boolean} isAudited - The `isAudited` parameter is a boolean flag that indicates whether
   * the operation should be audited or not. If set to `true`, the operation will be audited, meaning
   * that a record of the operation will be kept for auditing purposes. If set to `false`, the
   * operation will not
   * @param {IContext} ctx - The `ctx` parameter in the `upsert` function likely stands for the context
   * object that provides information about the current execution context. This context object may
   * contain data such as user information, request details, database connections, and more. It is
   * commonly used to pass contextual information throughout the application.
   * @param {string} name - The `name` parameter in the `upsert` function represents the name of the
   * entity you want to upsert in the database. It is a string value that specifies the entity to be
   * created or updated.
   * @param {TPrismaTx} tx - The `tx` parameter in the `upsert` function represents a transaction
   * object of type `TPrismaTx`. This object is typically used to manage database transactions,
   * ensuring that multiple operations are either all completed successfully or none at all. It helps
   * maintain data integrity and consistency within the database.
   * @param {Create} create - The `create` parameter in the `upsert` function represents the data that
   * will be used to create a new entity if it does not already exist in the database. It typically
   * includes the values for the fields of the entity that need to be set when creating a new record.
   * This data is used
   * @param {Update} update - The `update` parameter in the `upsert` function represents the data that
   * should be used to update an existing entity if a match is found during the upsert operation. This
   * data will be applied to the existing entity if it exists, or a new entity will be created with
   * this data if no
   * @param {Include} [include] - The `include` parameter in the `upsert` function allows you to
   * specify related models that should be included in the result. It is an optional parameter that can
   * be used to eagerly load related data along with the main entity.
   * @param {Select} [select] - The `select` parameter in the `upsert` function is used to specify
   * which fields of the entity you want to include in the result. If the `select` parameter is
   * provided, only the specified fields will be returned in the result. If the `select` parameter is
   * not provided, the
   * @param {Where} [where] - The `where` parameter in the `upsert` function is used to specify the
   * conditions that must be met for the operation to update or create a new entity. It is typically
   * used to identify the entity that needs to be updated or created based on certain criteria.
   * @returns The `upsert` function is returning a `Promise` that resolves to an `Entity`.
   */
  @OtelMethodCounter()
  @Span('upsert repository')
  async upsert(
    isAudited: boolean,
    ctx: IContext,
    name: string,
    tx: TPrismaTx,
    create: Create,
    update: Update,
    include?: Include,
    select?: Select,
    where?: Where,
  ): Promise<Entity> {
    return await WriteHelper.upsert<
      Entity,
      Create,
      Update,
      Include,
      Select,
      Where
    >(
      isAudited,
      ctx,
      name,
      tx,
      this._entity,
      create,
      update,
      include ? include : this.defaultInclude,
      select ? select : this.defaultSelect,
      where ? where : this.defaultWhere,
    );
  }

  @OtelMethodCounter()
  @Span('create repository')
  async create(
    isAudited: boolean,
    ctx: IContext,
    body: Create,
    tx: TPrismaTx,
    include?: Include,
    select?: Select,
  ): Promise<Entity> {
    return WriteHelper.create<Entity, Create, Include, Select>(
      isAudited,
      ctx,
      body,
      tx,
      this._entity,
      this.cacheManager,
      include ? include : this.defaultInclude,
      select ? select : this.defaultSelect,
    );
  }

  @OtelMethodCounter()
  @Span('upsert')
  async createMany(body: any, tx: TPrismaTx): Promise<Prisma.BatchPayload> {
    return WriteHelper.createMany<CreateMany>(body, tx, this._entity);
  }

  /**
   * This TypeScript function asynchronously updates an entity using provided parameters and helper
   * methods.
   * @param {boolean} isAudited - The `isAudited` parameter is a boolean flag that indicates whether
   * the update operation should be audited or not. If set to `true`, the update operation will be
   * audited, meaning that a record of the update will be kept for auditing purposes. If set to
   * `false`, the update
   * @param {IContext} ctx - The `ctx` parameter in the `update` function likely stands for the context
   * object, which is commonly used to pass contextual information or resources to functions or
   * methods. In this case, it seems to be of type `IContext`. The `ctx` parameter is passed along with
   * other parameters to the
   * @param {string} id - The `id` parameter in the `update` function represents the unique identifier
   * of the entity that you want to update. It is typically a string value that uniquely identifies the
   * entity within the database. When calling the `update` function, you need to provide the `id` of
   * the entity that you
   * @param {Update} body - The `body` parameter in the `update` function represents the data that you
   * want to update for the entity with the specified `id`. It typically contains the new values that
   * you want to set for the entity's properties. This data should adhere to the structure defined by
   * the `Update` type,
   * @param {TPrismaTx} tx - The `tx` parameter in the `update` function appears to be of type
   * `TPrismaTx`. This parameter likely represents a transaction object that is used to interact with a
   * database using Prisma. It is commonly used to perform database operations within a transactional
   * context, ensuring data consistency and integrity
   * @param {Include} [include] - The `include` parameter in the `update` function is used to specify
   * which related entities should be included in the update operation. It allows you to fetch data
   * from related tables along with the main entity being updated.
   * @param {Select} [select] - The `select` parameter in the `update` function is used to specify
   * which fields of the entity you want to include in the result. If the `select` parameter is
   * provided, only the fields specified in it will be returned in the response. If the `select`
   * parameter is not provided,
   * @param {Where} [where] - The `where` parameter in the `update` function is used to specify the
   * conditions that must be met for the update operation to be applied to the entity. It is typically
   * used to filter the entity or entities that need to be updated based on certain criteria.
   * @returns The `update` function returns a Promise that resolves to an `Entity`.
   */
  @OtelMethodCounter()
  @Span('update repository')
  async update(
    isAudited: boolean,
    ctx: IContext,
    id: string,
    body: Update,
    tx: TPrismaTx,
    include?: Include,
    select?: Select,
    where?: Where,
  ): Promise<Entity> {
    return WriteHelper.update<Entity, Update, Include, Select, Where>(
      isAudited,
      ctx,
      id,
      body,
      tx,
      this._entity,
      this.cacheManager,
      include ? include : this.defaultInclude,
      select ? select : this.defaultSelect,
      where ? where : this.defaultWhere,
    );
  }

  /**
   * This function is an asynchronous method that deletes an entity based on the provided parameters
   * and returns a Promise of the deleted entity.
   * @param {boolean} isAudited - The `isAudited` parameter is a boolean flag that indicates whether
   * the deletion operation should be audited or not. If set to `true`, the deletion will be audited,
   * meaning that a record of the deletion will be kept for auditing purposes. If set to `false`, the
   * deletion will
   * @param {IContext} ctx - The `ctx` parameter in the `delete` method likely stands for the context
   * object `IContext`. This object typically contains information and references that are relevant to
   * the current operation or request being processed. It is commonly used to pass along important data
   * or settings throughout the application.
   * @param {string} id - The `id` parameter in the `delete` function represents the unique identifier
   * of the entity that you want to delete from the database. It is typically a string value that
   * uniquely identifies the entity within the database table. When calling the `delete` function, you
   * need to provide the `id` of
   * @param {TPrismaTx} tx - The `tx` parameter in the `delete` method is of type `TPrismaTx`. It is
   * likely used to pass a Prisma transaction object that allows you to perform database operations
   * within a transactional context. This can be useful when you need to ensure that a series of
   * database operations are
   * @param {Include} [include] - The `include` parameter in the `delete` method is used to specify
   * which related models should be included in the deletion operation. It allows you to delete not
   * only the main entity but also any related entities that are connected to it. This can help ensure
   * data integrity and consistency when deleting records from the
   * @param {Select} [select] - The `select` parameter in the `delete` method allows you to specify
   * which fields of the entity you want to include in the deletion operation. If the `select`
   * parameter is provided, only the specified fields will be included in the deletion process. If it
   * is not provided, the default set of
   * @param {Where} [where] - The `where` parameter in the `delete` function is used to specify the
   * conditions that must be met for the entity to be deleted. It is typically used to filter the
   * entity that needs to be deleted based on certain criteria.
   * @returns The `delete` method is returning a `Promise` that resolves to an `Entity`.
   */
  @OtelMethodCounter()
  @Span('delete repository')
  async delete(
    isAudited: boolean,
    ctx: IContext,
    id: string,
    tx: TPrismaTx,
    include?: Include,
    select?: Select,
    where?: Where,
  ): Promise<Entity> {
    return DeleteHelper.delete<Entity, Include, Select, Where>(
      isAudited,
      ctx,
      id,
      tx,
      this._entity,
      this.cacheManager,
      include ? include : this.defaultInclude,
      select ? select : this.defaultSelect,
      where ? where : this.defaultWhere,
    );
  }

  /**
   * This TypeScript function deletes a batch of items based on the provided IDs and optional
   * conditions within a transaction.
   * @param {string[]} ids - The `ids` parameter is an array of strings representing the IDs of the
   * items that you want to delete in a batch operation.
   * @param {TPrismaTx} tx - The `tx` parameter is of type `TPrismaTx`, which likely represents a
   * transaction object used for database operations in a Prisma context. It is passed to the
   * `deleteBatch` function along with an array of `ids` to delete records in bulk. The function also
   * accepts an optional
   * @param {Where} [where] - The `where` parameter in the `deleteBatch` function is an optional
   * parameter that allows you to specify additional conditions for deleting the records. If a `where`
   * object is provided, only the records that match the specified conditions will be deleted. If no
   * `where` object is provided, the function
   * @returns The `deleteBatch` function returns a Promise that resolves to a `Prisma.BatchPayload`
   * object.
   */
  @OtelMethodCounter()
  @Span('deleteBatch repostitory')
  async deleteBatch(
    ids: string[],
    tx: TPrismaTx,
    where?: Where,
  ): Promise<Prisma.BatchPayload> {
    return DeleteHelper.deleteBatch(
      ids,
      tx,
      this._entity,
      this.cacheManager,
      where ? where : this.defaultWhere,
    );
  }

  /**
   * This TypeScript function asynchronously retrieves an entity by its ID using Prisma and includes
   * optional parameters for specifying additional data to fetch.
   * @param {string} id - The `id` parameter is a string that represents the unique identifier of the
   * entity you want to retrieve from the database.
   * @param {TPrismaTx} tx - The `tx` parameter in the `getById` function is of type `TPrismaTx`, which
   * likely represents a transaction object used for database operations with Prisma. It is passed to
   * the function to perform database operations related to fetching an entity by its ID.
   * @param {Include} [include] - The `include` parameter in the `getById` function is used to specify
   * which related models should be included in the query result. It allows you to eagerly load related
   * data along with the main entity being fetched. This can help reduce the number of database queries
   * needed to fetch all the required data.
   * @param {Select} [select] - The `select` parameter in the `getById` function is used to specify
   * which fields of the entity should be included in the query result. If the `select` parameter is
   * provided, only the specified fields will be returned in the query result. If the `select`
   * parameter is not provided,
   * @returns The `getById` function returns a Promise that resolves to an `Entity` object. The
   * `getById` function internally calls `ReadHelper.getById` with the provided parameters to fetch the
   * entity with the specified `id`.
   */
  @OtelMethodCounter()
  @Span('getById repository')
  async getById(
    id: string,
    tx: TPrismaTx,
    include?: Include,
    select?: Select,
  ): Promise<Entity> {
    return ReadHelper.getById<Entity, Include, Select>(
      id,
      tx,
      this._entity,
      this.cacheManager,
      include ? include : this.defaultInclude,
      select ? select : this.defaultSelect,
    );
  }

  /**
   * This function retrieves an entity using specified parameters and default values if not provided.
   * @param {TPrismaTx} tx - The `tx` parameter is of type `TPrismaTx`, which likely represents a
   * transaction object used in Prisma for database operations. It is passed to the `get` function to
   * perform database queries within a transaction context.
   * @param {Where} [where] - The `where` parameter in the `get` function is used to specify the
   * conditions that the retrieved entity must meet. It is an optional parameter that allows you to
   * filter the results based on certain criteria. If provided, the `get` function will only return
   * entities that match the specified conditions.
   * @param {Include} [include] - The `include` parameter in the `get` function is used to specify
   * which related models should be included in the query result. It allows you to fetch related data
   * along with the main entity being queried. If the `include` parameter is not provided, the function
   * will use the default include settings specified
   * @param {Select} [select] - The `select` parameter in the `get` function is used to specify which
   * fields of the entity you want to retrieve from the database. If a `select` parameter is provided
   * when calling the `get` function, it will be used to determine the fields to include in the query.
   * If no
   * @returns The `get` function is returning a Promise that resolves to an `Entity` object. The
   * function is using the `ReadHelper.get` method to fetch the entity based on the provided parameters
   * such as transaction, include, select, and where conditions.
   */
  @OtelMethodCounter()
  @Span('get repository')
  async get(
    tx: TPrismaTx,
    where?: Where,
    include?: Include,
    select?: Select,
  ): Promise<Entity> {
    return ReadHelper.get<Entity, Include, Select, Where>(
      tx,
      this._entity,
      include ? include : this.defaultInclude,
      select ? select : this.defaultSelect,
      where ? where : this.defaultWhere,
    );
  }

  /**
   * This function retrieves multiple entities based on the provided parameters using Prisma.
   * @param {TPrismaTx} tx - The `tx` parameter is of type `TPrismaTx` and is used to represent a
   * Prisma transaction. It is typically used to perform database operations within a transactional
   * context.
   * @param {Include} [include] - The `include` parameter in the `getMany` function is used to specify
   * which related models should be included in the query results. It allows you to fetch related data
   * along with the main entity being queried. If the `include` parameter is not provided, the function
   * will use the default include settings
   * @param {Select} [select] - The `select` parameter in the `getMany` function allows you to specify
   * which fields you want to retrieve for the entities. It is used to define the shape of the data
   * that will be returned from the database query. If the `select` parameter is provided when calling
   * the `getMany`
   * @param {Where} [where] - The `where` parameter in the `getMany` function is used to specify the
   * conditions that the entities must meet in order to be included in the result set. It is typically
   * used to filter the entities based on certain criteria, such as matching specific values or ranges
   * of values in the database.
   * @returns The `getMany` function returns a Promise that resolves to an array of entities of type
   * `Entity`. The function uses the `ReadHelper.getMany` method to fetch the entities based on the
   * provided parameters such as `include`, `select`, and `where`. If these parameters are not
   * provided, the function uses default values for `include`, `select`, and `where` defined within the
   * class
   */
  @OtelMethodCounter()
  @Span('getMany repository')
  async getMany(
    tx: TPrismaTx,
    include?: Include,
    select?: Select,
    where?: Where,
  ): Promise<Entity[]> {
    return ReadHelper.getMany<Entity, Include, Select, Where>(
      tx,
      this._entity,
      include ? include : this.defaultInclude,
      select ? select : this.defaultSelect,
      where ? where : this.defaultWhere,
    );
  }

  /**
   * The `listCursor` function in TypeScript returns a Promise of a list cursor result based on the
   * provided context, transaction, optional include parameters, and optional where parameters.
   * @param {IContext} ctx - The `ctx` parameter in the `listCursor` function likely stands for the
   * context object that provides access to various resources and information within the application.
   * It is commonly used to pass information such as the current user, request details, database
   * connections, and other context-specific data to functions or methods.
   * @param {TPrismaTx} tx - The `tx` parameter in the `listCursor` function likely stands for a
   * transaction object that is used to interact with a database. It is of type `TPrismaTx`, which
   * suggests that it may be a specific type related to database transactions, possibly used with
   * Prisma ORM. This parameter
   * @param {Include} [include] - The `include` parameter in the `listCursor` function is used to
   * specify which related models should be included in the query result. It is an optional parameter
   * that allows you to customize the data retrieval behavior by specifying the related models that
   * should be eagerly loaded along with the main entity.
   * @param {Where} [where] - The `where` parameter in the `listCursor` function is used to specify
   * conditions for filtering the entities that will be included in the result. It allows you to narrow
   * down the selection based on specific criteria such as property values or relationships. By
   * providing a `where` object, you can control which
   * @returns The `listCursor` function returns a Promise that resolves to an
   * `IListCursorResult<Entity>` object. The function calls `ReadHelper.listCursor` with the provided
   * parameters and returns the result.
   */
  @OtelMethodCounter()
  @Span('listCursor repository')
  async listCursor(
    ctx: IContext,
    tx: TPrismaTx,
    include?: Include,
    where?: Where,
  ): Promise<IListCursorResult<Entity>> {
    return ReadHelper.listCursor<Entity, Include, Where>(
      ctx,
      tx,
      this._entity,
      include ? include : this.defaultInclude,
      where ? where : this.defaultWhere,
    );
  }

  /**
   * This function performs pagination for a list of entities based on the provided context,
   * transaction, and optional filter criteria.
   * @param {IContext} ctx - The `ctx` parameter typically stands for the context object, which
   * contains information about the current request or operation. It is commonly used in web
   * development to pass along details such as user authentication, request headers, and other
   * contextual data. In this function, the `ctx` parameter is likely being used to
   * @param {TPrismaTx} tx - The `tx` parameter in the `listPagination` function likely refers to a
   * transaction object that is used to interact with a database. It is commonly used in database
   * operations to ensure data consistency and integrity. In this context, `tx` is of type `TPrismaTx`,
   * which suggests that
   * @param {Where} [where] - The `where` parameter in the `listPagination` function is used to specify
   * conditions for filtering the entities that will be paginated. It allows you to define criteria
   * based on which the entities will be retrieved from the database. If no `where` parameter is
   * provided, the function will use the default
   * @returns The `listPagination` function is returning a Promise that resolves to an
   * `IListPaginationResult<Entity>` object. The function is using the `ReadHelper.listPagination`
   * method to perform the pagination operation on the specified entity using the provided context,
   * transaction, and optional `where` condition. If no `where` condition is provided, it falls back to
   * using the `defaultWhere` condition defined within
   */
  @OtelMethodCounter()
  @Span('listPagination repository')
  async listPagination(
    ctx: IContext,
    tx: TPrismaTx,
    where?: Where,
  ): Promise<IListPaginationResult<Entity>> {
    return ReadHelper.listPagination<Entity, Where>(
      ctx,
      tx,
      this._entity,
      where ? where : this.defaultWhere,
    );
  }

  /**
   * The function `getAudits` retrieves a list of audits with specific fields from the database using
   * Prisma and pagination.
   * @param {IContext} ctx - The `ctx` parameter is of type `IContext`, which likely contains
   * contextual information or settings needed for the operation. It could include things like user
   * authentication details, request information, or other context-specific data.
   * @param {TPrismaTx} tx - The `tx` parameter in the `getAudits` function is of type `TPrismaTx`. It
   * is likely used to represent a transaction object related to Prisma, which is a modern database
   * toolkit for Node.js and TypeScript. Transactions are used to group multiple database operations
   * into a single unit
   * @returns The `getAudits` function is returning a Promise that resolves to an
   * `IListPaginationResult` containing a list of `AuditList` items. The function uses the
   * `ReadHelper.listPaginationWithInclude` method to fetch audits from the database based on the
   * provided criteria and select fields. The audits returned will have properties such as id,
   * changeCount, action, username, and createdAt.
   */
  @OtelMethodCounter()
  @Span('getAudits repository')
  async getAudits(
    ctx: IContext,
    tx: TPrismaTx,
  ): Promise<IListPaginationResult<AuditList>> {
    return ReadHelper.listPaginationWithInclude<
      AuditList,
      Prisma.AuditWhereInput | Prisma.AuditWhereUniqueInput,
      Prisma.AuditSelect
    >(
      ctx,
      tx,
      'audit',
      {
        auditable: this._entity,
      },
      {
        id: true,
        changeCount: true,
        action: true,
        username: true,
        createdAt: true,
      },
    );
  }

  /**
   * This TypeScript function retrieves an audit record by its ID from a Prisma transaction.
   * @param {TPrismaTx} tx - The `tx` parameter is of type `TPrismaTx`, which likely represents a
   * Prisma transaction object used for database operations.
   * @param {string} id - The `id` parameter is a string that represents the unique identifier of the
   * audit record you want to retrieve.
   * @returns The `getAudit` function returns a Promise that resolves to an `Audit` object or `null`.
   */
  @OtelMethodCounter()
  @Span('getAudit repository')
  async getAudit(tx: TPrismaTx, id: string): Promise<Audit | null> {
    return await tx.audit.findUnique({
      where: {
        id,
      },
    });
  }
}
