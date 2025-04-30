import { Cache } from 'cache-manager';
import { TPrismaTx } from '../../domain/entities';
import { ReadHelper } from './read.helper';
import { AuditAction, Prisma } from '@prisma/client';
import { IContext } from '../../frameworks/shared/interceptors/context.interceptor';

export class WriteHelper {
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
   * Create many doesn't have auditable so it's not recommended to use this!
   * @param body CreateMany
   * @param tx TxPrismaTx
   * @param entity string
   * @returns Prisma.BatchPayload
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
