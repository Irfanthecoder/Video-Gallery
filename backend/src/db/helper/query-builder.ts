/**
 * Builds WHERE clause and params from a plain object (AND equality only).
 * Keys are column names; values are bound as $1, $2, ...
 */
export function buildWhereClause(whereData: Record<string, unknown>): { whereClause: string; params: unknown[] } {
  const keys = Object.keys(whereData);
  if (keys.length === 0) {
    return { whereClause: "", params: [] };
  }
  const whereClause = " WHERE " + keys.map((k, i) => `${k} = $${i + 1}`).join(" AND ");
  const params = keys.map((k) => whereData[k]);
  return { whereClause, params };
}
