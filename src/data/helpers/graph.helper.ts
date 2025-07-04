import { TPrismaTx } from '../../domain/entities';
import { TEdge, TPath } from '../../domain/entities/graph.entity';

export class GraphHelper {
  private static async getDatabaseType(
    tx: TPrismaTx,
  ): Promise<'postgresql' | 'mssql'> {
    // @ts-ignore - Prisma doesn't expose this type directly
    return tx.$queryRaw`SELECT current_setting('server_version_num')`
      .then(() => 'postgresql')
      .catch(() => 'mssql');
  }

  private static async getPathQuery(
    tx: TPrismaTx,
    tableName: string,
    fromId?: string,
  ): Promise<string> {
    const dbType = await this.getDatabaseType(tx);

    if (dbType === 'postgresql') {
      return `
        WITH RECURSIVE distance_graph ("A", "B", path) AS (
          SELECT gg."A"::varchar, gg."B"::varchar, ARRAY[gg."A", gg."B"]::varchar[] as path
          FROM "${tableName}" as gg --non-recursive
        UNION ALL
            SELECT g."A"::varchar, gg."B"::varchar, g.path || ARRAY[gg."B"]::varchar[]
            FROM "${tableName}" as gg
            JOIN distance_graph as g 
            ON gg."A" = g."B"
            and gg."B" != ALL(g.path)
        )
        ${fromId ? `select * from distance_graph where "A" = '${fromId}'` : 'select * from distance_graph'};`;
    } else {
      // MSSQL syntax - using STRING_AGG for path concatenation
      return `
        WITH distance_graph ("A", "B", path) AS (
          SELECT 
            gg."A", 
            gg."B", 
            CAST(gg."A" + ',' + gg."B" AS VARCHAR(MAX)) as path
          FROM "${tableName}" as gg --non-recursive
        UNION ALL
            SELECT 
              g."A", 
              gg."B", 
              CAST(g.path + ',' + gg."B" AS VARCHAR(MAX))
            FROM "${tableName}" as gg
            JOIN distance_graph as g 
            ON gg."A" = g."B"
            WHERE g.path NOT LIKE '%' + gg."B" + '%'
        )
        ${fromId ? `select * from distance_graph where "A" = '${fromId}'` : 'select * from distance_graph'};`;
    }
  }

  static async findNodes<Entity extends Record<string, any>, Include>(
    tx: TPrismaTx,
    entityName: string,
    include?: Include,
  ): Promise<Entity[]> {
    return await tx[entityName].findMany({
      include,
    });
  }

  /**
   * ## findEdges
   * This function is to used query many to many self relation tables.
   * this will result two column A and B.
   * This is edges is usefull later to create hierarchical graph data structure.
   * @param tx TPrismaTx
   * @param tableName string
   * @returns <TEdge[]>
   */
  static async findEdges(tx: TPrismaTx, tableName: string) {
    return await tx.$queryRawUnsafe<TEdge[]>(`select * from "${tableName}"`);
  }

  /**
   * ## findPath
   * * This function is to find the path from many to many self relation or we can now is graph data structure.
   * https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/.
   * * In order to generate the path we need to queries using CTE recursive functions. I have great articles about this query.
   * https://blog.whiteprompt.com/implementing-graph-queries-in-a-relational-database-7842b8075ca8. This function will create 3 table
   * ***(A, B, path)***. This is path is usefull later to create hierarchical graph data structure.
   * @param tx TPrismaTx
   * @param tableName string
   * @returns <TPath[]>
   */
  static async findPath(tx: TPrismaTx, tableName: string) {
    const query = await this.getPathQuery(tx, tableName);
    const results = await tx.$queryRawUnsafe<TPath[]>(query);

    // For MSSQL, we need to convert the comma-separated path string back to an array
    const dbType = await this.getDatabaseType(tx);
    if (dbType === 'mssql') {
      return results.map((result) => ({
        ...result,
        path: (result.path as unknown as string).split(','),
      }));
    }

    return results;
  }

  /**
   * ## findPathByFromId
   * * This function is to find the path from many to many self relation or we can now is graph data structure.
   * https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/.
   * * In order to generate the path we need to queries using CTE recursive functions. I have great articles about this query.
   * https://blog.whiteprompt.com/implementing-graph-queries-in-a-relational-database-7842b8075ca8. This function will create 3 table
   * ***(A, B, path)***. This is path is usefull later to create hierarchical graph data structure.
   * @param tx TPrismaTx
   * @param tableName string
   * @param fromId string
   * @returns <TPath[]>
   */
  static async findPathByFromId(
    tx: TPrismaTx,
    tableName: string,
    fromId: string,
  ) {
    const query = await this.getPathQuery(tx, tableName, fromId);
    const results = await tx.$queryRawUnsafe<TPath[]>(query);

    // For MSSQL, we need to convert the comma-separated path string back to an array
    const dbType = await this.getDatabaseType(tx);
    if (dbType === 'mssql') {
      return results.map((result) => ({
        ...result,
        path: (result.path as unknown as string).split(','),
      }));
    }

    return results;
  }
}
