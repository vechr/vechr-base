/* The `DeleteHelper` class provides methods for deleting single and multiple entities with optional
auditing and cache management functionalities. */
import { AuditAction, Prisma } from '@prisma/client';
import { Cache } from 'cache-manager';
import { TPrismaTx } from '../../domain/entities';
import { ReadHelper } from './read.helper';
import { IContext } from '../../frameworks/shared/interceptors/context.interceptor';

export class DeleteHelper {
  /**
   * This function deletes a record of a specified entity, handles auditing if enabled, and clears the
   * cache for the deleted record.
   * @param {boolean} isAudited - The `isAudited` parameter is a boolean flag that indicates whether
   * auditing is enabled for the operation. If set to `true`, the function will create an audit trail
   * for the delete operation.
   * @param {IContext} ctx - The `ctx` parameter in the `delete` function represents the context object
   * that contains information about the current user making the request. It typically includes details
   * such as the user's name, ID, and any other relevant user information needed for performing
   * operations within the function.
   * @param {string} id - The `id` parameter in the `delete` function represents the unique identifier
   * of the entity that you want to delete from the database. It is a string type and is used to locate
   * the specific entity that needs to be deleted.
   * @param {TPrismaTx} tx - The `tx` parameter in the `delete` function represents a Prisma
   * transaction object that allows you to interact with the database using Prisma Client. It is used
   * to perform database operations like deleting data, querying data, and more within a transactional
   * context.
   * @param {string} entity - The `entity` parameter in the `delete` function represents the name of
   * the entity/table in the database from which you want to delete a record. It is used to specify the
   * Prisma model on which the delete operation will be performed.
   * @param {Cache} cacheManager - The `cacheManager` parameter in the `delete` function is used to
   * provide a cache manager instance that helps in managing cached data. In the provided code snippet,
   * the `cacheManager` is used to delete cached data associated with the entity after it has been
   * successfully deleted from the database. This helps
   * @param {Include} [include] - The `include` parameter in the `delete` function is used to specify
   * related models that should be included in the deletion operation. This allows you to delete not
   * only the main entity but also any related entities that are specified in the `include` parameter.
   * @param {Select} [select] - The `select` parameter in the `delete` function is used to specify
   * which fields of the entity should be selected after the deletion operation. It allows you to
   * retrieve only specific fields of the entity instead of fetching the entire entity object.
   * @param {Where} [where] - The `where` parameter in the `delete` function is used to specify the
   * conditions for deleting the entity. It allows you to provide additional filters to determine which
   * entity should be deleted. The `where` parameter is of type `Where`, which extends `Record<string,
   * any>`, meaning it can
   * @returns The `delete` method returns the deleted entity data after deleting it from the database.
   */
  static async delete<
    Entity extends Record<string, any>,
    Include extends Record<string, any>,
    Select extends Record<string, any>,
    Where extends Record<string, any>,
  >(
    isAudited: boolean,
    ctx: IContext,
    id: string,
    tx: TPrismaTx,
    entity: string,
    cacheManager: Cache,
    include?: Include,
    select?: Select,
    where?: Where,
  ): Promise<Entity> {
    await ReadHelper.getById(id, tx, entity, cacheManager);

    const data = await tx[entity].delete({
      where: { id, ...where },
      include,
      select,
    });

    // create audit object
    if (isAudited) {
      const lastAudited = await tx.audit.findFirst({
        where: {
          auditable: entity,
          auditableId: data.id,
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
          previous: data,
          incoming: {},
          action: AuditAction.DELETE,
          username: ctx.user.name,
          userId: ctx.user.id,
        },
      });
    }

    if (data) {
      await cacheManager.del(data.id);
    }

    return data;
  }

  /**
   * Delete many doesn't have auditable so it's not recommended to use this!
   * This static async function deletes multiple records by their IDs from a Prisma entity and also
   * deletes corresponding cached data.
   * @param {string[]} ids - The `ids` parameter is an array of strings representing the IDs of the
   * records that you want to delete in a batch operation.
   * @param {TPrismaTx} tx - The `tx` parameter is an object representing a Prisma transaction. It is
   * used to interact with the database and perform operations like deleting records.
   * @param {string} entity - The `entity` parameter in the `deleteBatch` function represents the name
   * of the entity/table in the database from which you want to delete records in batches.
   * @param {Cache} cacheManager - The `cacheManager` parameter in the `deleteBatch` function is an
   * instance of a cache manager that is used to interact with a cache storage system. It is passed to
   * the function to handle caching operations such as getting and deleting cached data related to the
   * entities being deleted in the batch operation.
   * @param {Where} [where] - The `where` parameter in the `deleteBatch` function is used to specify
   * additional conditions for deleting records from the database. It allows you to filter the records
   * that will be deleted based on certain criteria in addition to the primary condition of matching
   * the `id` with the values in the `ids`
   * @returns The `deleteBatch` function returns a Promise that resolves to a `Prisma.BatchPayload`
   * object, which represents the result of the batch delete operation performed on the specified
   * entity using the provided transaction (`tx`), entity name (`entity`), and optional `where`
   * condition.
   */
  static async deleteBatch<Where extends Record<string, any> = object>(
    ids: string[],
    tx: TPrismaTx,
    entity: string,
    cacheManager: Cache,
    where?: Where,
  ): Promise<Prisma.BatchPayload> {
    const deleted = await tx[entity].deleteMany({
      where: {
        id: {
          in: ids,
        },
        ...where,
      },
    });

    // Delete the cached
    ids.forEach(async (id: string) => {
      if (await cacheManager.get(id)) await cacheManager.del(id);
    });

    return deleted;
  }
}
