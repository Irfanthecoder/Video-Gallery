import postgresHelper from "../helper/postgres.helper.js";

/** Creates a new row in the specified table */
export async function createOne(
  table: string,
  data: Record<string, unknown>
): Promise<unknown | null> {
  return postgresHelper.create(table, data);
}
