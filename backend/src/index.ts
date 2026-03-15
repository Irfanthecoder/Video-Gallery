import "dotenv/config";
import "./bootstrap.js";
import express from "express";
import cors from "cors";
import path from "path";
import { config } from "./config/index.js";
import { ensureUploadDirs, errorHandler } from "./middlewares/index.js";
import { videosRouter } from "./routes/index.js";
import { createLogger } from "./utils/index.js";
import { VIDEOS_BASE, API_BODY_LIMIT } from "./constants/index.js";

const log = createLogger("server");
const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: API_BODY_LIMIT }));
app.use("/uploads", express.static(config.uploadDirAbs));
app.use(VIDEOS_BASE, videosRouter);
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use(errorHandler);

async function start(): Promise<void> {
  await ensureUploadDirs();
  log.info("Upload paths", { uploadDirAbs: config.uploadDirAbs, thumbnailsDirAbs: config.thumbnailsDirAbs });
  app.listen(config.port, () => {
    log.info("Server listening", { port: config.port, url: `http://localhost:${config.port}` });
  });
}

start().catch((err) => {
  log.error("Startup error", err);
  process.exit(1);
});
