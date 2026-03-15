import path from "path";

const env = process.env;
const uploadBase = process.env.UPLOAD_BASE || process.cwd();
const uploadDir = env.UPLOAD_DIR || "uploads";
const thumbnailsDir = env.THUMBNAILS_DIR || "uploads/thumbnails";

export const config = {
  port: Number(env.PORT) || 4000,
  nodeEnv: env.NODE_ENV || "development",
  databaseUrl: env.DATABASE_URL,
  uploadDir,
  thumbnailsDir,
  uploadDirAbs: path.resolve(uploadBase, uploadDir),
  thumbnailsDirAbs: path.resolve(uploadBase, thumbnailsDir),
} as const;

export type Config = typeof config;
