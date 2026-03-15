import "dotenv/config";
import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "../config/index.js";
import { createLogger } from "../utils/index.js";

const log = createLogger("runSchema");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

async function run(): Promise<void> {
  const client = new pg.Client({ connectionString: config.databaseUrl });
  await client.connect();
  try {
    await client.query(schema);
    log.info("Schema applied");
  } finally {
    await client.end();
  }
}

run().catch((e) => {
  log.error("Schema apply failed", e);
  process.exit(1);
});
