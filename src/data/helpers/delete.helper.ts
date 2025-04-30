import { AuditAction, Prisma } from '@prisma/client';
import { Cache } from 'cache-manager';
import { TPrismaTx } from '../../domain/entities';
import { ReadHelper } from './read.helper';
import { IContext } from '../../frameworks/shared/interceptors/context.interceptor';

export class DeleteHelper {
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
   * @param ids string[]
   * @param tx TxPrismaTx
   * @param entity string
   * @param cacheManager Cache
   * @param where Where
   * @returns Prisma.BatchPayload
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
