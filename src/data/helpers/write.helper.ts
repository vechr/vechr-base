import { Cache } from 'cache-manager';
import { TPrismaTx } from '../../domain/entities';
import { ReadHelper } from './read.helper';
import { AuditAction, Prisma } from '@prisma/client';
import { IContext } from '../../frameworks/shared/interceptors/context.interceptor';

export class WriteHelper {
  /**
   * This static async function creates a new entity in a database, optionally auditing the action and
   * caching the result.
   * @param {boolean} isAudited - The `isAudited` parameter is a boolean flag that indicates whether
   * auditing should be performed for the entity being created. If set to `true`, an audit log will be
   * created to track the creation action.
   * @param {IContext} ctx - The `ctx` parameter in the `create` function represents the context object
   * that contains information about the current user and their session. It typically includes details
   * such as the user's name, ID, permissions, and other relevant information needed for performing
   * operations within the application.
   * @param {Create} body - The `body` parameter in the `create` method represents the data that you
   * want to use to create a new entity in the database. It should be an object that contains the
   * properties and values needed to create the entity. This data will be passed to the Prisma `create`
   * method to insert
   * @param {TPrismaTx} tx - The `tx` parameter in the `create` function is of type `TPrismaTx`, which
   * is likely a transaction object used to interact with a Prisma database. It seems to have methods
   * for creating entities and auditing changes.
   * @param {string} entity - The `entity` parameter in the `create` method refers to the name of the
   * entity for which a new record is being created. It is used to access the corresponding Prisma
   * model in the transaction (`tx`) object.
   * @param {Cache} cacheManager - The `cacheManager` parameter in the `create` function is of type
   * `Cache`. It is used to manage caching of data, likely for improving performance by storing and
   * retrieving data from a cache instead of making repeated database queries.
   * @param {Include} [include] - The `include` parameter in the `create` method is used to specify
   * which related models should be included in the response along with the main entity being created.
   * This allows you to fetch related data in a single query, reducing the number of database queries
   * needed.
   * @param {Select} [select] - The `select` parameter in the `create` method allows you to specify
   * which fields of the created entity you want to include in the response. This can be useful when
   * you only need specific fields of the entity and want to reduce the amount of data returned.
   * @returns The `create` method is returning a Promise that resolves to an `Entity` object.
   */
  static async create<
    Entity extends Record<string, any>,
    Create extends Record<string, any>,
    Include extends Record<string, any>,
    Select extends Record<string, any>,
  >(
    isAudited: boolean,
    ctx: IContext,
    body: Create,
    tx: TPrismaTx,
    entity: string,
    cacheManager: Cache,
    include?: Include,
    select?: Select,
  ): Promise<Entity> {
    const data = await tx[entity].create({
      data: body,
      include,
      select,
    });

    // create audit object
    if (isAudited) {
      await tx.audit.create({
        data: {
          auditable: entity,
          auditableId: data.id,
          previous: {},
          incoming: data,
          action: AuditAction.CREATE,
          username: ctx.user.name,
          userId: ctx.user.id,
        },
      });
    }

    if (data) {
      await cacheManager.set(data.id, data);
    }

    return data;
  }

  /**
   * Delete many doesn't have auditable so it's not recommended to use this!
   * The function `createMany` asynchronously creates multiple records of a specified entity using
   * Prisma.
   * @param {CreateMany} body - The `body` parameter is an object containing the data that you want to
   * create multiple records for in the specified entity.
   * @param {TPrismaTx} tx - The `tx` parameter in the `createMany` function seems to be an instance of
   * `TPrismaTx`, which is likely a type representing a transaction object in a Prisma context. This
   * object is used to interact with the Prisma client to perform database operations within a
   * transaction.
   * @param {string} entity - The `entity` parameter in the `createMany` function represents the name
   * of the entity or table in the database where the data will be created. It is used to specify the
   * target entity for the data creation operation.
   * @returns The function `createMany` returns a Promise that resolves to a `Prisma.BatchPayload`
   * object after creating multiple records of a specified entity using the provided data in the
   * transaction context.
   */
  static async createMany<CreateMany extends Record<string, any>>(
    body: CreateMany,
    tx: TPrismaTx,
    entity: string,
  ): Promise<Prisma.BatchPayload> {
    const data = await tx[entity].createMany({
      data: body,
    });

    return data;
  }

  /**
   * The function `upsert` performs an upsert operation on a given entity, handling auditing if
   * specified.
   * @param {boolean} isAudited - The `isAudited` parameter is a boolean flag that indicates whether
   * auditing should be performed for the operation. If `isAudited` is set to `true`, the function will
   * create an audit trail for the upsert operation. If it is set to `false`, no auditing will be
   * performed
   * @param {IContext} ctx - The `ctx` parameter in the `upsert` function represents the context object
   * that contains information about the current user or environment. It typically includes details
   * such as the user's name, user ID, and other relevant information needed for performing operations
   * within the function.
   * @param {string} name - The `name` parameter in the `upsert` function represents the name of the
   * entity you want to upsert in the database. It is used as part of the criteria to identify the
   * entity to be upserted.
   * @param {TPrismaTx} tx - The `tx` parameter in the `upsert` function is of type `TPrismaTx`, which
   * is likely a transaction object used with Prisma for interacting with the database. It is used to
   * perform database operations like creating, updating, and querying data within a transactional
   * context.
   * @param {string} entity - The `entity` parameter in the `upsert` function represents the name of
   * the entity or table in the database that you want to upsert data into. It is used to specify the
   * target entity where the upsert operation will be performed.
   * @param {Create} create - The `create` parameter in the `upsert` function represents the data that
   * will be used to create a new entity if it does not already exist in the database. It should be an
   * object of type `Create` which extends `Record<string, any>`. This object contains the values that
   * will
   * @param {Update} update - The `update` parameter in the `upsert` function represents the data that
   * should be used to update an existing entity if a match is found based on the provided criteria. If
   * no match is found, this data will be used to create a new entity.
   * @param {Include} [include] - The `include` parameter in the `upsert` function is used to specify
   * related models that should be included in the upsert operation. This allows you to fetch related
   * data along with the main entity being upserted.
   * @param {Select} [select] - The `select` parameter in the `upsert` function is used to specify
   * which fields of the entity you want to select after the upsert operation is performed. It allows
   * you to control the shape of the returned data by specifying the fields you are interested in.
   * @param {Where} [where] - The `where` parameter in the `upsert` function is used to specify the
   * conditions that must be met for the upsert operation to be performed. It is an object that
   * contains key-value pairs representing the fields and values that the database should use to
   * determine whether to update an existing record or insert
   * @returns The `upsert` function returns a Promise that resolves to an `Entity` object.
   */
  static async upsert<
    Entity extends Record<string, any>,
    Create extends Record<string, any>,
    Update extends Record<string, any>,
    Include extends Record<string, any>,
    Select extends Record<string, any>,
    Where extends Record<string, any>,
  >(
    isAudited: boolean,
    ctx: IContext,
    name: string,
    tx: TPrismaTx,
    entity: string,
    create: Create,
    update: Update,
    include?: Include,
    select?: Select,
    where?: Where,
  ): Promise<Entity> {
    // Check if existing are exists!
    const existingObj = await ReadHelper.get<Entity, Include, Select, any>(
      tx,
      entity,
      include,
      select,
      {
        name,
      },
    );

    const data = await tx[entity].upsert({
      where: {
        name,
        ...where,
      },
      create,
      update,
      include,
      select,
    });

    // create audit object
    if (isAudited) {
      const lastAudited = await tx.audit.findFirst({
        where: {
          auditable: entity,
          auditableId: existingObj ? existingObj.id : '',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      await tx.audit.create({
        data: {
          auditable: entity,
          auditableId: data.id,
          changeCount: lastAudited ? lastAudited.changeCount + 1 : 0,
          previous: existingObj ? existingObj : {},
          incoming: data,
          action: existingObj ? AuditAction.UPDATE : AuditAction.CREATE,
          username: ctx.user.name,
          userId: ctx.user.id,
        },
      });
    }

    return data;
  }

  /**
   * This function updates an entity in a database, optionally auditing the changes and caching the
   * updated data.
   * @param {boolean} isAudited - The `isAudited` parameter is a boolean flag that indicates whether
   * auditing is enabled for this update operation. If set to `true`, the function will create an audit
   * trail for the update operation.
   * @param {IContext} ctx - The `ctx` parameter in the `update` function represents the context object
   * containing information about the current user. It typically includes details such as the user's
   * name, ID, permissions, and other relevant information needed for performing operations within the
   * application. This context object is often used to enforce security, access
   * @param {string} id - The `id` parameter in the `update` function represents the unique identifier
   * of the entity that you want to update. It is typically a string value that uniquely identifies the
   * entity in the database.
   * @param {Update} body - The `body` parameter in the `update` function represents the data that you
   * want to update in the entity. It should be an object containing the fields and values that you
   * want to update in the entity identified by the `id`. When calling the `update` function, you would
   * pass the new
   * @param {TPrismaTx} tx - The `tx` parameter in the `update` function represents a Prisma
   * transaction object. This object is used to interact with the database and perform operations like
   * updating data, querying data, and creating new records within a transaction. It ensures that all
   * operations within the transaction are atomic and either all succeed or
   * @param {string} entity - The `entity` parameter in the `update` function represents the name of
   * the entity (table) in the database that you want to update. It is used to specify which entity's
   * data you are updating in the database.
   * @param {Cache} cacheManager - The `cacheManager` parameter in the `update` function is an instance
   * of the `Cache` class that is used for caching data. It is passed to the function to handle caching
   * operations such as setting and retrieving data from the cache.
   * @param {Include} [include] - The `include` parameter in the `update` function is used to specify
   * related models that should be included in the update operation. This allows you to fetch related
   * data along with the main entity being updated. It helps in reducing the number of queries needed
   * to fetch related data separately.
   * @param {Select} [select] - The `select` parameter in the `update` function is used to specify
   * which fields of the entity should be included in the response. It allows you to control the shape
   * of the data returned after the update operation.
   * @param {Where} [where] - The `where` parameter in the `update` function is used to specify the
   * conditions that must be met for the update operation to be applied to the database. It allows you
   * to filter the records that will be updated based on certain criteria.
   * @returns The `update` function is returning a Promise that resolves to an `Entity` object after
   * updating the entity in the database.
   */
  static async update<
    Entity extends Record<string, any>,
    Update extends Record<string, any>,
    Include extends Record<string, any>,
    Select extends Record<string, any>,
    Where extends Record<string, any>,
  >(
    isAudited: boolean,
    ctx: IContext,
    id: string,
    body: Update,
    tx: TPrismaTx,
    entity: string,
    cacheManager: Cache,
    include?: Include,
    select?: Select,
    where?: Where,
  ): Promise<Entity> {
    const existingObj = await ReadHelper.getById<Entity, Include, Select>(
      id,
      tx,
      entity,
      cacheManager,
      include,
      select,
    );

    const data = await tx[entity].update({
      where: { id, ...where },
      data: body,
      include,
      select,
    });

    // create audit object
    if (isAudited) {
      const lastAudited = await tx.audit.findFirst({
        where: {
          auditable: entity,
          auditableId: existingObj ? existingObj.id : '',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      await tx.audit.create({
        data: {
          auditable: entity,
          auditableId: data.id,
          changeCount: lastAudited ? lastAudited?.changeCount + 1 : 0,
          previous: existingObj,
          incoming: data,
          action: AuditAction.UPDATE,
          username: ctx.user.name,
          userId: ctx.user.id,
        },
      });
    }

    if (data) {
      await cacheManager.set(data.id, data);
    }

    return data;
  }
}
