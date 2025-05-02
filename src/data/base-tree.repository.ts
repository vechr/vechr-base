import { TPrismaTx } from '../domain/entities';
import { camelize } from '../frameworks/shared/utils/string.util';
import { NodeTree } from '../domain/entities/tree.entity';
import { TreeHelper } from './helpers';

export abstract class BaseTreeRepository<
  Entity extends NodeTree,
  Include extends Record<string, any>,
  Where extends Record<string, any>,
> {
  protected _entity: string;
  protected _tableName: string;

  public defaultInclude: Include;
  public defaultWhere: Where;

  constructor(entity: new () => Entity) {
    this._entity = camelize(entity.name.substring(4));
    this._tableName = entity.name.substring(4);
  }

  /**
   * ## findRoots
   * This function is to used query the tree model from database.
   * The database will have id, parentId and name. in order to create a model tree into objects,
   * we need to query recusively. If you want to have the detail you can access this link
   * * https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-recursive-query/
   * @param tx TPrismaTx
   * @param include Include
   * @returns Promise<Entity[]>
   */
  async findRoots(tx: TPrismaTx, include?: Include): Promise<Entity[]> {
    return TreeHelper.findRoots(tx, this._tableName, this._entity, include);
  }

  /**
   * ## findTrees
   * This function is to used query the tree model from database.
   * The database will have id, parentId and name. in order to create a model tree into objects,
   * we need to query recusively. If you want to have the detail you can access this link
   * * https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-recursive-query/
   * @param tx TPrismaTx
   * @param include Include
   * @returns Promise<Entity[]>
   */
  async findTrees(tx: TPrismaTx, include?: Include): Promise<Entity[]> {
    return TreeHelper.findTrees(tx, this._tableName, this._entity, include);
  }

  /**
   * ## findDescendantsTree
   * This function is to used query the tree model from database.
   * The database will have id, parentId and name. in order to create a model tree into objects,
   * we need to query recusively. If you want to have the detail you can access this link
   * * https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-recursive-query/
   * @param tx TPrismaTx
   * @param id string
   * @param include Include
   * @returns Promise<Entity | undefined>
   */
  async findDescendantsTree(
    tx: TPrismaTx,
    id: string,
    include?: Include,
  ): Promise<Entity | undefined> {
    return TreeHelper.findDescendantsTree(
      tx,
      this._tableName,
      id,
      this._entity,
      include,
    );
  }

  /**
   * The function `createNewBodyForCreate` modifies a given body object by restructuring its entries
   * field and connecting it to a parent field.
   * @param {any} body - The `body` parameter is an object that contains data for creating a new
   * entity. It likely includes information such as the fields and values needed to create the entity.
   * @param {string} entriesFieldName - The `entriesFieldName` parameter is a string that represents
   * the field name in the `body` object where an array of entries is stored.
   * @param {string} parentFieldName - The `parentFieldName` parameter in the `createNewBodyForCreate`
   * function refers to the field name in the body object that will be used to specify the parent
   * entity's ID. This field will be used to connect the new entity being created to its parent entity,
   * if a parent ID is provided
   * @returns The function `createNewBodyForCreate` is returning the modified `body` object after
   * making changes to the `entriesFieldName` and `parentFieldName` properties.
   */
  public createNewBodyForCreate<T>(
    body: any,
    entriesFieldName: string,
    parentFieldName: string,
  ): T {
    body[entriesFieldName] = {
      createMany: {
        data: body[entriesFieldName].map((roleId: string[]) => ({
          roleId: roleId,
        })),
      },
    };

    body[parentFieldName] = body.parentId
      ? {
          connect: {
            id: body.parentId,
          },
        }
      : undefined;

    return body;
  }

  /**
   * The function `createNewBodyForUpdate` creates a new body object for updating data with specific
   * fields and mappings.
   * @param {any} body - The `body` parameter is an object that contains the data for creating a new
   * entry or updating an existing entry.
   * @param {string} entriesFieldName - The `entriesFieldName` parameter is used to specify the field
   * name in the `body` object that contains the entries data that needs to be updated or created.
   * @param {string} parentFieldName - The `parentFieldName` parameter in the `createNewBodyForUpdate`
   * function is used to specify the field name in the body object that represents the parent entity.
   * This field is used to connect or disconnect the current entity to its parent entity based on the
   * `parentId` provided in the body object.
   * @returns the updated `body` object after making modifications to the `entriesFieldName` and
   * `parentFieldName` fields.
   */
  public createNewBodyForUpdate<T>(
    body: any,
    entriesFieldName: string,
    parentFieldName: string,
  ): T {
    if (body[entriesFieldName]) {
      body[entriesFieldName] = {
        deleteMany: {},
        createMany: {
          data: body[entriesFieldName].map((roleId: string) => ({
            roleId: roleId,
          })),
        },
      };
    }

    body[parentFieldName] = body.parentId
      ? {
          connect: {
            id: body.parentId,
          },
        }
      : { disconnect: {} };

    return body;
  }
}
