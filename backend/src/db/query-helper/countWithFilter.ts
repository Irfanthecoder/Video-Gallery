import type { AndOrQuery } from "../../interfaces/index.js";
import postgresHelper from "../helper/postgres.helper.js";
import { ANDORQueryBuilder } from "../helper/and-or-query-builder.js";

/** Returns total row count for the same WHERE as findWithFilter (no limit/offset). */
export async function countWithFilter(
  table: string,
  whereData: AndOrQuery
): Promise<number> {
  const { sql, params } = ANDORQueryBuilder(table, whereData, "COUNT(*)::int as count");
  const rows = await postgresHelper.execute(sql, params) as { count: number }[];
  return rows[0]?.count ?? 0;
}
