import path from "path";
import fs from "fs/promises";

/** Creates a relative path from a directory */
export function relativePath(fromDir: string, filePath: string): string {
  return path.relative(fromDir, filePath).replace(/\\/g, "/");
}

/** Joins multiple path segments */
export function joinPath(...segments: string[]): string {
  return path.join(...segments);
}

/** Ensures a directory exists */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}
