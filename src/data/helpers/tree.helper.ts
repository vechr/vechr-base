import { TPrismaTx } from '../../domain/entities';
import { NodeTree, TEntityTree, Tree } from '../../domain/entities/tree.entity';

/* The TreeHelper class in TypeScript provides methods for querying tree models from a database using
recursive queries. */
export class TreeHelper {
  /* The `WriteHelper` class in TypeScript provides methods for creating, updating, and upserting data
with optional auditing functionality. */
  /**
   * The function `queryManyToDB` retrieves multiple entities from a database based on their IDs and
   * includes optional related entities.
   * @param {TEntityTree[]} entities - The `entities` parameter is an array of objects of type
   * `TEntityTree`.
   * @param {TPrismaTx} tx - The `tx` parameter in the function `queryManyToDB` is typically an
   * instance of a Prisma transaction that allows you to interact with the database. It is used to
   * perform database operations such as querying, updating, and deleting data within a transactional
   * context.
   * @param {string} entityName - The `entityName` parameter in the `queryManyToDB` function represents
   * the name of the entity/table in the database that you want to query. It is used to specify which
   * entity/table you are querying data from in the database.
   * @param {Include} [include] - The `include` parameter in the `queryManyToDB` function is used to
   * specify which related entities should be included in the query result. It allows you to eagerly
   * load related data along with the main entity being queried. This can help reduce the number of
   * database queries needed to fetch all the required
   * @returns The function `queryManyToDB` returns a Promise that resolves to an array of entities of
   * type `Entity`. The entities are fetched from the database using the provided `tx` (Prisma
   * transaction) and `entityName`. The function also accepts an optional `include` parameter for
   * specifying additional related data to be included in the query result.
   */
  private static async queryManyToDB<Entity extends NodeTree, Include>(
    entities: TEntityTree[],
    tx: TPrismaTx,
    entityName: string,
    include?: Include,
  ): Promise<Entity[]> {
    return await tx[entityName].findMany({
      where: {
        id: {
          in: entities.map((val) => val.id),
        },
      },
      include,
    });
  }

  /**
   * ## findRoots
   * This function is to used query the tree model from database.
   * The database will have id, parentId and name. in order to create a model tree into objects,
   * we need to query recusively. If you want to have the detail you can access this link
   * * https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-recursive-query/
   * @param tx TPrismaTx
   * @param tableName string
   * @param entityName string
   * @param include Include (Prisma Include)
   * @returns Promise<Entity[]>
   */
  static async findRoots<Entity extends NodeTree, Include>(
    tx: TPrismaTx,
    tableName: string,
    entityName: string,
    include?: Include,
  ): Promise<Entity[]> {
    const entities = await tx.$queryRawUnsafe<TEntityTree[]>(`
        WITH RECURSIVE group_groups AS (
          SELECT 
            id, 
            "parentId", 
            name 
          FROM 
            "${tableName}"
          UNION 
          SELECT 
            r.id, 
            r."parentId", 
            r.name 
          FROM 
            "${tableName}" r 
            INNER JOIN group_groups g ON g.id = r."parentId"
        ) 
        SELECT * FROM group_groups;`);

    const data: Entity[] = await this.queryManyToDB(
      entities,
      tx,
      entityName,
      include,
    );
    const tree = new Tree<Entity>();

    return tree.buildTree(data);
  }

  /**
   * ## findDescendantsTree
   * This function is to used query the tree model from database.
   * The database will have id, parentId and name. in order to create a model tree into objects,
   * we need to query recusively. If you want to have the detail you can access this link
   * * https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-recursive-query/
   * @param tx TPrismaTx
   * @param tableName string
   * @param id string
   * @param entityName string
   * @param include Include
   * @returns Promise<Entity | undefined>
   */
  static async findDescendantsTree<Entity extends NodeTree, Include>(
    tx: TPrismaTx,
    tableName: string,
    id: string,
    entityName: string,
    include?: Include,
  ): Promise<Entity | undefined> {
    const entities = await tx.$queryRawUnsafe<TEntityTree[]>(`
        WITH RECURSIVE group_groups AS (
          SELECT 
            id, 
            "parentId", 
            name 
          FROM 
            "${tableName}"
          WHERE
            id = '${id}'
          UNION 
          SELECT 
            r.id, 
            r."parentId", 
            r.name 
          FROM 
            "${tableName}" r 
            INNER JOIN group_groups g ON g.id = r."parentId"
        ) 
        SELECT * FROM group_groups;`);

    const data: Entity[] = await this.queryManyToDB(
      entities,
      tx,
      entityName,
      include,
    );
    const tree = new Tree<Entity>();

    return tree.buildTree(data).find((tree) => tree.id === id);
  }

  /**
   * ## findTrees
   * This function is to used query the tree model from database.
   * The database will have id, parentId and name. in order to create a model tree into objects,
   * we need to query recusively. If you want to have the detail you can access this link
   * * https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-recursive-query/
   * @param tx TPrismaTx
   * @param tableName string
   * @param entityName string
   * @param include Include (Prisma Include)
   * @returns Promise<Entity[]>
   */
  static async findTrees<Entity extends NodeTree, Include>(
    tx: TPrismaTx,
    tableName: string,
    entityName: string,
    include?: Include,
  ): Promise<Entity[]> {
    const entities = await tx.$queryRawUnsafe<TEntityTree[]>(`
        WITH RECURSIVE group_groups AS (
          SELECT 
            id, 
            "parentId", 
            name 
          FROM 
            "${tableName}"
          UNION 
          SELECT 
            r.id, 
            r."parentId", 
            r.name 
          FROM 
            "${tableName}" r 
            INNER JOIN group_groups g ON g.id = r."parentId"
        ) 
        SELECT * FROM group_groups;`);

    const data: Entity[] = await this.queryManyToDB(
      entities,
      tx,
      entityName,
      include,
    );

    const tree = new Tree<Entity>();

    return tree.buildTree(data);
  }
}
