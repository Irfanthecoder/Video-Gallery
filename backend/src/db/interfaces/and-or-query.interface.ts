/**
 * Supported operators for WHERE conditions.
 * - eq: column = $n
 * - ilike: column ILIKE $n
 * - any: $n = ANY(column) (for array columns)
 */
export type WhereOp = "eq" | "ilike" | "any";

export interface WhereCondition {
  field: string;
  op: WhereOp;
  value?: unknown;
}

/** Structured WHERE clause: AND list of conditions. Values are always parameterized. */
export interface AndOrQuery {
  and?: WhereCondition[];
}
