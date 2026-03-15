import multer from "multer";
import path from "path";
import { v4 as randomUUID } from "uuid";
import { config } from "../config/index.js";
import { ensureDir } from "../utils/index.js";
import { VIDEO_MIME_TYPES, MAX_UPLOAD_BYTES, ERROR_MESSAGES } from "../constants/index.js";

export async function ensureUploadDirs(): Promise<void> {
  await ensureDir(config.uploadDirAbs);
  await ensureDir(config.thumbnailsDirAbs);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadDirAbs),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".mp4";
    cb(null, `video_${randomUUID()}${ext}`);
  },
});

export const uploadVideo = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (VIDEO_MIME_TYPES.includes(file.mimetype as never)) {
      cb(null, true);
    } else {
      cb(new Error(ERROR_MESSAGES.ONLY_VIDEO_FILES));
    }
  },
});
