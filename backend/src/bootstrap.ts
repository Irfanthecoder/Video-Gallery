/**
 * Set UPLOAD_BASE from backend app root (so uploads path is correct when run from any cwd).
 * Import this first in index.ts so config can use process.env.UPLOAD_BASE.
 */
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
if (!process.env.UPLOAD_BASE) {
  process.env.UPLOAD_BASE = path.resolve(__dirname, "..");
}
