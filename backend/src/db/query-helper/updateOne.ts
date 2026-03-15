import postgresHelper from "../helper/postgres.helper.js";

/** Updates a single row in the specified table */
export async function updateOne(
  table: string,
  data: Record<string, unknown>,
  whereData: Record<string, unknown>
): Promise<number> {
  return postgresHelper.update(table, data, whereData);
}
