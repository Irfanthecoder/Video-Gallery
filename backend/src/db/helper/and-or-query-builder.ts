import type { AndOrQuery, FindWithFilterOptions } from "../interfaces/index.js";

function formatColumns(columns: string | string[]): string {
  if (Array.isArray(columns)) return columns.join(", ");
  return columns === "*" || columns === "" ? "*" : columns;
}

/**
 * Builds parameterized SELECT SQL from table, columns, and AndOrQuery.
 * All values go into params; only table/columns/orderBy/field names are from app code.
 */
export function ANDORQueryBuilder(
  table: string,
  whereData: AndOrQuery,
  columns: string | string[] = "*",
  options?: FindWithFilterOptions
): { sql: string; params: unknown[] } {
  const cols = formatColumns(columns);
  const params: unknown[] = [];
  const conditions: string[] = [];
  let idx = 1;

  if (whereData.and?.length) {
    for (const c of whereData.and) {
      if (c.value === undefined || c.value === null || c.value === "") continue;
      switch (c.op) {
        case "eq":
          conditions.push(`${c.field} = $${idx}`);
          params.push(c.value);
          idx++;
          break;
        case "ilike":
          conditions.push(`${c.field} ILIKE $${idx}`);
          params.push(c.value);
          idx++;
          break;
        case "any":
          conditions.push(`$${idx} = ANY(${c.field})`);
          params.push(c.value);
          idx++;
          break;
        default:
          break;
      }
    }
  }

  let sql = `SELECT ${cols} FROM ${table}`;
  if (conditions.length > 0) sql += " WHERE " + conditions.join(" AND ");
  if (options?.orderBy) sql += ` ORDER BY ${options.orderBy}`;
  if (options?.limit != null) {
    sql += ` LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(options.limit, options.offset ?? 0);
  }

  return { sql, params };
}
