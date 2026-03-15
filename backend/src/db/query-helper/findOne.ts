import postgresHelper from "../helper/postgres.helper.js";

/** Finds a single row in the specified table */
export async function findOne(
  table: string,
  columns: string | string[] = "*",
  whereData: Record<string, unknown> = {}
): Promise<unknown | null> {
  const rows = await postgresHelper.read(table, columns, whereData);
  return rows[0] ?? null;
}
