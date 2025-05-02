/* The ReadHelper class provides methods for reading data from a database using Prisma with features
like pagination, cursor-based navigation, and caching. */
import { Cache } from 'cache-manager';
import { ExtendedNotFoundException } from '../../frameworks/shared/exceptions/common.exception';
import {
  IListCursorResult,
  IListPaginationResult,
  TPrismaTx,
} from '../../domain/entities';
import { IContext } from '../../frameworks/shared/interceptors/context.interceptor';
import {
  parsePaginationMeta,
  parsePaginationQuery,
} from '../../frameworks/shared/utils/query-pagination.util';
import { parseQueryCursor } from '../../frameworks/shared/utils/query-cursor.util';

export class ReadHelper {
  /**
   * This static async function in TypeScript retrieves multiple entities based on specified criteria
   * using Prisma.
   * @param {TPrismaTx} tx - The `tx` parameter is of type `TPrismaTx`, which is likely a transaction
   * object used to interact with a Prisma database.
   * @param {string} entity - The `entity` parameter in the `getMany` function represents the name of
   * the entity (table) in the database from which you want to retrieve data. It is used to specify the
   * entity for which you want to perform the database query.
   * @param {Include} [include] - The `include` parameter in the `getMany` function is used to specify
   * related models that should be included in the query result. This allows you to fetch data from
   * related tables along with the main entity being queried. It helps in reducing the number of
   * queries needed to fetch related data separately.
   * @param {Select} [select] - The `select` parameter in the `getMany` function allows you to specify
   * which fields you want to retrieve for each entity in the result set. By providing a `select`
   * parameter, you can control the shape of the data returned from the database query. This can be
   * useful for optimizing performance by
   * @param {Where} [where] - The `where` parameter in the `getMany` function is used to specify the
   * conditions that the entities must meet in order to be included in the result set. It allows you to
   * filter the entities based on certain criteria, such as specific field values or relationships.
   * @returns The function `getMany` returns a Promise that resolves to an array of entities of type
   * `Entity`.
   */
  static async getMany<Entity, Include, Select, Where>(
    tx: TPrismaTx,
    entity: string,
    include?: Include,
    select?: Select,
    where?: Where,
  ): Promise<Entity[]> {
    const data = await tx[entity].findMany({
      where,
      select,
      include,
    });

    return data;
  }
  /**
   * This function retrieves an entity by its ID from a cache or database using Prisma, with optional
   * include and select parameters.
   * @param {string} id - The `id` parameter is a string representing the unique identifier of the
   * entity you want to retrieve from the database.
   * @param {TPrismaTx} tx - The `tx` parameter in the function `getById` is of type `TPrismaTx`. It is
   * likely used to perform database operations using Prisma client methods within the transaction
   * context provided.
   * @param {string} entity - The `entity` parameter in the `getById` function represents the name of
   * the entity or table in the database that you want to retrieve data from. It is used to specify the
   * entity for which you are fetching data.
   * @param {Cache} cacheManager - The `cacheManager` parameter in the provided function is an instance
   * of a cache manager class that is used to store and retrieve data from a cache. It is passed to the
   * function to handle caching operations, such as getting data from the cache based on a specific key
   * (`id`), setting data in
   * @param {Include} [include] - The `include` parameter in the `getById` function is used to specify
   * related models that should be included in the query result. This allows you to fetch additional
   * data along with the main entity being retrieved. It helps in reducing the number of queries needed
   * to fetch related data by including them in a
   * @param {Select} [select] - The `select` parameter in the `getById` function allows you to specify
   * which fields you want to retrieve for the entity being fetched. By providing a `select` parameter,
   * you can control the shape of the data returned from the database query. This can be useful for
   * optimizing performance by only fetching
   * @returns The function `getById` returns a Promise that resolves to an Entity object. If the object
   * with the specified id is found in the cache, it returns that object. If not found in the cache, it
   * queries the database using the provided Prisma transaction `tx` to find the entity with the
   * specified id, includes any related entities specified in the `include` parameter, and selects
   * specific fields specified
   */
  static async getById<Entity, Include, Select>(
    id: string,
    tx: TPrismaTx,
    entity: string,
    cacheManager: Cache,
    include?: Include,
    select?: Select,
  ): Promise<Entity> {
    const value = await cacheManager.get(id);

    if (!value) {
      const data = await tx[entity].findUnique({
        where: {
          id,
        },
        include,
        select,
      });

      if (!data) {
        throw new ExtendedNotFoundException({
          message: `${entity} with id ${id} is not found!`,
        });
      }

      await cacheManager.set(id, data);
      return data;
    }

    return value as Entity;
  }
  /**
   * This static async function in TypeScript retrieves a single entity from a Prisma transaction based
   * on specified include, select, and where parameters.
   * @param {TPrismaTx} tx - The `tx` parameter is of type `TPrismaTx`, which is likely a transaction
   * object used for database operations in a Prisma client.
   * @param {string} entity - The `entity` parameter in the function represents the name of the entity
   * or table in the database that you want to query. It is used to specify which entity's data you
   * want to retrieve or work with in the database operations.
   * @param {Include} [include] - The `include` parameter in the `get` function is used to specify
   * related models that should be included in the query result. This allows you to fetch data from
   * related tables along with the main entity being queried. It helps in reducing the number of
   * queries needed to retrieve all the required data.
   * @param {Select} [select] - The `select` parameter in the `get` function allows you to specify
   * which fields you want to retrieve for the entity. It is used to define the shape of the data that
   * will be returned from the database query. By providing specific fields in the `select` parameter,
   * you can optimize the query
   * @param {Where} [where] - The `where` parameter in the function represents the condition or
   * criteria used to filter the data when querying the database. It is typically an object that
   * specifies the conditions that the data must meet in order to be retrieved from the database. For
   * example, you could use the `where` parameter to specify that
   * @returns a Promise that resolves to an entity of type `Entity`.
   */
  static async get<Entity, Include, Select, Where>(
    tx: TPrismaTx,
    entity: string,
    include?: Include,
    select?: Select,
    where?: Where,
  ): Promise<Entity> {
    const data = await tx[entity].findUnique({
      where,
      include,
      select,
    });

    return data;
  }

  static async listDropDown<Entity extends Record<string, any>>(
    ctx: IContext,
    tx: TPrismaTx,
    entity: string,
  ): Promise<Pick<Entity, 'id' | 'name'>[]> {
    const query = ctx.params.query as any;

    const data = await tx[entity].findMany({
      select: {
        id: true,
        name: true,
      },
      where: {
        name: {
          contains: query.search,
        },
      },
    });

    return data;
  }

  /**
   * This TypeScript function handles pagination for querying entities with Prisma.
   * @param {IContext} ctx - The `ctx` parameter is of type `IContext`, which likely contains
   * contextual information or settings needed for the operation. It could include things like request
   * parameters, headers, or other context-specific data.
   * @param {TPrismaTx} tx - The `tx` parameter in the `listPagination` function is of type
   * `TPrismaTx`. It is likely used as a transaction object for interacting with a Prisma database.
   * This parameter is used to perform database operations within the function, such as querying data
   * or updating records.
   * @param {string} entity - The `entity` parameter in the `listPagination` function represents the
   * name of the entity or table in the database that you want to query for pagination. It is used to
   * specify which entity's data you want to retrieve and paginate.
   * @param {Where} [where] - The `where` parameter in the `listPagination` function is used to filter
   * the results based on specific conditions. It allows you to pass in additional filtering criteria
   * for the database query. This parameter is optional, meaning you can choose to provide filtering
   * conditions or omit them if not needed.
   * @returns The `listPagination` function returns a Promise that resolves to an object with two
   * properties: `result` and `meta`.
   */
  static async listPagination<
    Entity extends Record<string, any>,
    Where extends Record<string, any>,
  >(
    ctx: IContext,
    tx: TPrismaTx,
    entity: string,
    where?: Where,
  ): Promise<IListPaginationResult<Entity>> {
    const query = ctx.params.query as any;

    const { limit, offset, order, page } = parsePaginationQuery<any>(query);

    const selectOptions = {
      orderBy: order,
      where: {
        ...query.filters.field,
        ...where,
      },
    };

    const pageOptions = {
      take: limit,
      skip: offset,
    };

    const selectField = {
      select: {
        id: true,
        name: true,
      },
    };

    const queryData = await ReadHelper.queryData<Entity>(
      selectOptions,
      { ...selectOptions, ...selectField, ...pageOptions },
      tx,
      entity,
    );

    const meta = parsePaginationMeta<Entity>({
      result: queryData.data,
      total: queryData.total,
      page,
      limit,
    });

    return {
      result: queryData.data,
      meta,
    };
  }

  /**
   * This TypeScript function handles pagination and includes for querying data from a database using
   * Prisma.
   * @param {IContext} ctx - The `ctx` parameter is of type `IContext`, which likely represents the
   * context or environment in which the function is being executed. It could contain information or
   * settings relevant to the operation of the function.
   * @param {TPrismaTx} tx - The `tx` parameter in the `listPaginationWithInclude` function is of type
   * `TPrismaTx`. It is likely used to represent a transaction object that allows you to interact with
   * a database using Prisma. This parameter is used within the function to perform database operations
   * such as querying data.
   * @param {string} entity - The `entity` parameter in the `listPaginationWithInclude` function
   * represents the name of the entity or table in the database that you want to query and paginate the
   * results for. It is a string value that specifies the entity you are working with, such as "User",
   * "Product", "Order
   * @param {Where} [where] - The `where` parameter in the `listPaginationWithInclude` function is used
   * to specify additional conditions for filtering the data that will be retrieved from the database.
   * It allows you to narrow down the results based on specific criteria. The `where` parameter should
   * be an object that contains key-value pairs representing
   * @param {Select} [select] - The `select` parameter in the `listPaginationWithInclude` function is
   * used to specify which fields of the entity you want to include in the query result. It allows you
   * to selectively retrieve only the fields you are interested in, rather than fetching all fields of
   * the entity.
   * @returns The function `listPaginationWithInclude` returns a Promise that resolves to an object
   * with two properties:
   * 1. `result`: Contains the data fetched from the database based on the pagination and selection
   * criteria.
   * 2. `meta`: Contains metadata about the pagination such as total number of results, current page,
   * and limit per page.
   */
  static async listPaginationWithInclude<
    Entity extends Record<string, any>,
    Where extends Record<string, any>,
    Select extends Record<string, any>,
  >(
    ctx: IContext,
    tx: TPrismaTx,
    entity: string,
    where?: Where,
    select?: Select,
  ): Promise<IListPaginationResult<Entity>> {
    const query = ctx.params.query as any;

    const { limit, offset, order, page } = parsePaginationQuery<any>(query);

    const selectOptions = {
      orderBy: order,
      where: {
        ...query.filters.field,
        ...where,
      },
    };

    const pageOptions = {
      take: limit,
      skip: offset,
    };

    const selectField = {
      select,
    };

    const queryData = await ReadHelper.queryData<Entity>(
      selectOptions,
      { ...selectOptions, ...selectField, ...pageOptions },
      tx,
      entity,
    );

    const meta = parsePaginationMeta<Entity>({
      result: queryData.data,
      total: queryData.total,
      page,
      limit,
    });

    return {
      result: queryData.data,
      meta,
    };
  }

  /**
   * The function `listCursor` in TypeScript retrieves a list of entities based on specified criteria
   * and pagination options.
   * @param {IContext} ctx - The `ctx` parameter is of type `IContext`, which likely represents the
   * context or environment in which the function is being executed. It could contain information or
   * settings relevant to the current operation.
   * @param {TPrismaTx} tx - The `tx` parameter in the `listCursor` function is of type `TPrismaTx`. It
   * is likely an instance of a Prisma transaction that is used to interact with the database. This
   * parameter is used to perform database operations such as querying data or updating records within
   * the function.
   * @param {string} entity - The `entity` parameter in the `listCursor` function represents the name
   * of the entity or table in the database that you want to query. It is used to specify which
   * entity's data you want to retrieve or manipulate within the function.
   * @param {Include} [include] - The `include` parameter in the `listCursor` function is used to
   * specify which related models should be included in the query result. It allows you to fetch data
   * from related tables along with the main entity being queried. This can help reduce the number of
   * queries needed to fetch all the required data and
   * @param {Where} [where] - The `where` parameter in the `listCursor` function is used to specify
   * additional conditions for filtering the data that will be retrieved from the database. It allows
   * you to narrow down the results based on specific criteria.
   * @returns The `listCursor` function returns a Promise that resolves to an object with two
   * properties:
   * 1. `result`: an array of entities of type `Entity` that match the query criteria
   * 2. `meta`: an object containing metadata about the query results, including:
   *    - `lastCursor`: the ID of the last entity in the result set, or an empty string if no entities
   * were returned
   */
  static async listCursor<
    Entity extends Record<string, any>,
    Include extends Record<string, any>,
    Where extends Record<string, any>,
  >(
    ctx: IContext,
    tx: TPrismaTx,
    entity: string,
    include?: Include,
    where?: Where,
  ): Promise<IListCursorResult<Entity>> {
    const query = ctx.params.query as any;

    const { limit, order, cursor } = parseQueryCursor<any>(query);

    const selectOptions = {
      orderBy: order,
      where: {
        ...query.filters.field,
        ...where,
      },
    };

    let pageOptions = {
      take: limit,
    };

    if (cursor !== undefined && cursor !== '') {
      await tx[entity].findUnique({
        where: {
          id: cursor,
        },
      });

      pageOptions = {
        ...pageOptions,
        ...{ cursor: { id: cursor }, skip: 1 },
      };
    }

    const queryData = await ReadHelper.queryData<Entity>(
      selectOptions,
      { ...selectOptions, ...{ include }, ...pageOptions },
      tx,
      entity,
    );

    const lastCursor =
      queryData.data.length > 0
        ? queryData.data[queryData.data.length - 1].id
        : '';

    return {
      result: queryData.data,
      meta: {
        lastCursor: lastCursor,
        total: queryData.total,
      },
    };
  }

  /**
   * The function `queryData` retrieves data from a Prisma database using specified arguments and
   * returns the total count and data of a specified entity.
   * @param {any} totalArgs - The `totalArgs` parameter is used to specify the arguments for counting
   * the total number of entities in the database table. These arguments are typically used to filter
   * the entities that are counted.
   * @param {any} findArgs - `findArgs` is an object that contains the arguments used to filter and
   * retrieve data from the database for the specified entity. It is used in the
   * `tx[entity].findMany(findArgs)` method call to fetch the data based on the provided criteria.
   * @param {TPrismaTx} tx - The `tx` parameter in the `queryData` function is of type `TPrismaTx`,
   * which is likely a type representing a Prisma transaction object used to interact with the
   * database. This parameter is used to perform database operations such as counting records and
   * fetching data for a specific entity.
   * @param {string} entity - The `entity` parameter in the `queryData` function represents the name of
   * the entity or table in the database that you want to query data from. It is used to specify which
   * entity's data you want to retrieve using the Prisma client.
   * @returns The function `queryData` returns a Promise that resolves to an object with two
   * properties: `total` which is a number representing the total count of entities based on the
   * `totalArgs`, and `data` which is an array of entities based on the `findArgs`.
   */
  private static async queryData<Entity extends Record<string, any>>(
    totalArgs: any,
    findArgs: any,
    tx: TPrismaTx,
    entity: string,
  ): Promise<{
    total: number;
    data: Entity[];
  }> {
    const total = await tx[entity].count(totalArgs);
    const data = await tx[entity].findMany(findArgs);

    return {
      total,
      data,
    };
  }
}
