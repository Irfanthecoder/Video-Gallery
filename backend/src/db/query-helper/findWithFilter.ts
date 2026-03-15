import type { AndOrQuery, FindWithFilterOptions } from "../interfaces/index.js";
import postgresHelper from "../helper/postgres.helper.js";
import { ANDORQueryBuilder } from "../helper/and-or-query-builder.js";

/** Finds rows in the specified table with optional WHERE and ORDER BY */
export async function findWithFilter(
  table: string,
  columns: string | string[] = "*",
  whereData: AndOrQuery,
  options?: FindWithFilterOptions
): Promise<unknown[]> {
  const { sql, params } = ANDORQueryBuilder(table, whereData, columns, options);
  return postgresHelper.execute(sql, params);
}
