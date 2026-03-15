import postgresHelper from "../helper/postgres.helper.js";

/** Finds all rows in the specified table */
export async function findAll(
  table: string,
  columns: string | string[] = "*",
  whereData: Record<string, unknown> = {},
  orderBy?: string
): Promise<unknown[]> {
  return postgresHelper.read(table, columns, whereData, orderBy);
}
