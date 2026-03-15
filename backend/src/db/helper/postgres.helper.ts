import type pg from "pg";
import { query, getClient } from "../client.js";
import { buildWhereClause } from "./query-builder.js";
import { createLogger } from "../../utils/index.js";

const log = createLogger("postgresHelper");

function formatColumns(columns: string | string[]): string {
  if (Array.isArray(columns)) return columns.join(", ");
  return columns === "*" || columns === "" ? "*" : columns;
}

export class PostgresHelper {
  /** SELECT from table with optional WHERE and ORDER BY */
  async read(
    table: string,
    columns: string | string[] = "*",
    whereData: Record<string, unknown> = {},
    orderBy?: string
  ): Promise<pg.QueryResultRow[]> {
    const cols = formatColumns(columns);
    const { whereClause, params } = buildWhereClause(whereData);
    let sql = `SELECT ${cols} FROM ${table}${whereClause}`;
    if (orderBy) sql += ` ORDER BY ${orderBy}`;
    log.info("read query", { sql });
    const result = await query(sql, params);
    return result.rows;
  }

  /** INSERT into table, RETURNING * */
  async create(table: string, data: Record<string, unknown>): Promise<pg.QueryResultRow | null> {
    const keys = Object.keys(data);
    if (keys.length === 0) return null;
    const cols = keys.join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const values = keys.map((k) => data[k]);
    const sql = `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`;
    log.info("create query", { sql });
    const result = await query(sql, values);
    return result.rows[0] ?? null;
  }

  /** UPDATE table SET ... WHERE ... */
  async update(
    table: string,
    data: Record<string, unknown>,
    whereData: Record<string, unknown>
  ): Promise<number> {
    const result = await this.runUpdate(table, data, whereData, false, undefined);
    return typeof result === "number" ? result : 0;
  }

  /** UPDATE table SET ... WHERE ... RETURNING * */
  async updateReturning(
    table: string,
    data: Record<string, unknown>,
    whereData: Record<string, unknown>
  ): Promise<pg.QueryResultRow[]> {
    const result = await this.runUpdate(table, data, whereData, true, undefined);
    return Array.isArray(result) ? result : [];
  }

  /** Run UPDATE (optionally RETURNING) with optional client for transactions */
  private async runUpdate(
    table: string,
    data: Record<string, unknown>,
    whereData: Record<string, unknown>,
    returning: boolean,
    client: pg.PoolClient | undefined
  ): Promise<number | pg.QueryResultRow[]> {
    const whereKeys = Object.keys(whereData);
    if (whereKeys.length === 0) throw new Error("WHERE clause required for update");
    const setKeys = Object.keys(data);
    const setClause = setKeys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const whereClause = whereKeys.map((k, i) => `${k} = $${setKeys.length + i + 1}`).join(" AND ");
    const values = [...Object.values(data), ...Object.values(whereData)];
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}${returning ? " RETURNING *" : ""}`;
    log.info("update query", { sql });
    const runner = client ? client.query.bind(client) : query;
    const result = await runner(sql, values);
    if (returning) return (result as pg.QueryResult).rows;
    return (result as pg.QueryResult).rowCount ?? 0;
  }

  /** Execute raw SQL with params */
  async execute<T extends pg.QueryResultRow = pg.QueryResultRow>(
    sql: string,
    params: unknown[] = []
  ): Promise<pg.QueryResultRow[]> {
    log.info("execute query", { sql });
    const result = await query<T>(sql, params);
    return result.rows;
  }

  /** Distinct values from an array column (unnest); table/column are identifiers from app code */
  async getDistinctFromArrayColumn(
    table: string,
    arrayColumn: string,
    orderByAlias = "value"
  ): Promise<string[]> {
    const sql = `SELECT DISTINCT unnest(${arrayColumn}) AS ${orderByAlias} FROM ${table} ORDER BY ${orderByAlias}`;
    log.info("getDistinctFromArrayColumn", { sql });
    const result = await query<Record<string, string>>(sql, []);
    return result.rows.map((r) => r[orderByAlias]);
  }

  /** Top N values from an array column by occurrence count (unnest, group, order by count desc). */
  async getTopFromArrayColumn(
    table: string,
    arrayColumn: string,
    limit: number,
    alias = "tag"
  ): Promise<string[]> {
    const sql = `SELECT ${alias} FROM (
      SELECT unnest(${arrayColumn}) AS ${alias} FROM ${table}
    ) t
    GROUP BY ${alias}
    ORDER BY COUNT(*) DESC
    LIMIT $1`;
    log.info("getTopFromArrayColumn", { sql });
    const result = await query<Record<string, string>>(sql, [limit]);
    return result.rows.map((r) => r[alias]);
  }

  /** Run multiple updates in a transaction; runs fn(client), then COMMIT or ROLLBACK */
  async withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    const client = await getClient();
    try {
      await client.query("BEGIN");
      const out = await fn(client);
      await client.query("COMMIT");
      return out;
    } catch (e) {
      await client.query("ROLLBACK").catch(() => {});
      log.error("withTransaction failed", e);
      throw e;
    } finally {
      client.release();
    }
  }

  /** UPDATE using a transaction client (no RETURNING) */
  async updateWithClient(
    client: pg.PoolClient,
    table: string,
    data: Record<string, unknown>,
    whereData: Record<string, unknown>
  ): Promise<number> {
    const result = await this.runUpdate(table, data, whereData, false, client);
    return typeof result === "number" ? result : 0;
  }

  /** UPDATE with RETURNING * using a transaction client */
  async updateReturningWithClient(
    client: pg.PoolClient,
    table: string,
    data: Record<string, unknown>,
    whereData: Record<string, unknown>
  ): Promise<pg.QueryResultRow[]> {
    const result = await this.runUpdate(table, data, whereData, true, client);
    return Array.isArray(result) ? result : [];
  }

  /** Run multiple queries in a transaction; rolls back on first failure */
  async executeWithTransaction(
    queries: { sql: string; params?: unknown[] }[]
  ): Promise<pg.QueryResultRow[][]> {
    const client = await getClient();
    try {
      await client.query("BEGIN");
      const results: pg.QueryResultRow[][] = [];
      for (const q of queries) {
        const res = await client.query(q.sql, q.params ?? []);
        results.push(res.rows);
      }
      await client.query("COMMIT");
      return results;
    } catch (e) {
      await client.query("ROLLBACK").catch(() => {});
      log.error("executeWithTransaction failed", e);
      throw e;
    } finally {
      client.release();
    }
  }

  async getClient(): Promise<pg.PoolClient> {
    return getClient();
  }
}

const defaultInstance = new PostgresHelper();
export default defaultInstance;
