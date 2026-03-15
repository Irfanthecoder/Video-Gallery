import path from "path";
import {
  createThumbnailsBatch,
  findThumbnailsByVideoId,
  setPrimaryThumbnail as setPrimaryThumbnailDal,
} from "../dal/index.js";
import type { Thumbnail } from "../interfaces/index.js";
import { config } from "../config/index.js";
import { NUM_THUMBNAILS, THUMB_WIDTH } from "../constants/index.js";
import { joinPath, relativePath, ensureDir, createLogger } from "../utils/index.js";
import { v4 as randomUUID } from "uuid";
import fs from "fs/promises";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const log = createLogger("thumbnailService");

/** Target 3–5 thumbnails per video; clamp so extraction always requests a valid count. */
const THUMB_COUNT = Math.min(5, Math.max(3, NUM_THUMBNAILS));

/** Extracts frames from video (or creates placeholder), then persists thumbnails to DB. */
export async function generateThumbnails(videoId: number, videoPath: string): Promise<Thumbnail[]> {
  const uploadRoot = config.uploadDirAbs;
  const outDirAbs = path.join(config.thumbnailsDirAbs, String(videoId));
  await ensureDir(outDirAbs);

  const videoPathAbs = path.isAbsolute(videoPath) ? path.normalize(videoPath) : path.resolve(uploadRoot, videoPath);
  log.info("Generating thumbnails", { videoId, videoPathAbs, outDirAbs });
  const framePaths = await extractFrames(videoPathAbs, outDirAbs, uploadRoot, THUMB_COUNT);
  const paths = framePaths.length > 0
    ? framePaths
    : [await createPlaceholderThumbnail(outDirAbs, uploadRoot)];

  if (framePaths.length === 0) {
    log.info("No frames extracted, using placeholder", { videoId });
  }

  const rows = paths.map((file_path, i) => ({
    video_id: videoId,
    file_path,
    is_primary: i === 0,
  }));
  return createThumbnailsBatch(rows);
}

/** Extract a single frame at timestamp t; returns relative path or null on failure. */
function extractOneFrame(
  videoPathNorm: string,
  outPathAbs: string,
  outPathNorm: string,
  timestamp: number,
  durationSec: number,
  uploadRoot: string
): Promise<string | null> {
  return new Promise((resolve) => {
    const seek = Math.min(Math.max(0, timestamp), durationSec - 0.01);
    ffmpeg(videoPathNorm)
      .seekInput(seek)
      .outputOptions([
        "-vframes 1",
        "-q:v 4",
        `-vf scale=${THUMB_WIDTH}:-2`,
      ])
      .output(outPathNorm)
      .on("end", () => resolve(relativePath(uploadRoot, outPathAbs)))
      .on("error", (err) => {
        log.info("Frame extract failed", { outPathAbs, seek, error: err.message });
        resolve(null);
      })
      .run();
  });
}

async function extractFrames(
  videoPathAbs: string,
  outDirAbs: string,
  uploadRoot: string,
  count: number
): Promise<string[]> {
  try {
    await fs.access(videoPathAbs).catch(() => {
      throw new Error(`Video file not found: ${videoPathAbs}`);
    });
    const videoPathNorm = videoPathAbs.replace(/\\/g, "/");
    const { duration } = await new Promise<{ duration: number }>((resolve, reject) => {
      ffmpeg(videoPathNorm).ffprobe((err: Error | null, data: { format?: { duration?: number } }) => {
        if (err) return reject(err);
        resolve({ duration: (data?.format?.duration as number) ?? 0 });
      });
    });
    const sec = Math.max(0.5, duration ?? 1);
    const minSpacing = 0.35;
    const maxFramesByDuration = Math.max(1, Math.floor(sec / minSpacing));
    const actualCount = sec <= 3 ? Math.min(3, maxFramesByDuration) : Math.min(count, maxFramesByDuration);
    const numFrames = Math.max(1, actualCount);
    const timestamps: number[] = [];
    if (numFrames === 1) {
      timestamps.push(sec * 0.5);
    } else {
      for (let i = 0; i < numFrames; i++) {
        timestamps.push((sec * (i + 1)) / (numFrames + 1));
      }
    }

    const tasks = timestamps.map((t, i) => {
      const name = `thumb_${i + 1}.jpg`;
      const outPathAbs = path.join(outDirAbs, name);
      const outPathNorm = outPathAbs.replace(/\\/g, "/");
      return extractOneFrame(videoPathNorm, outPathAbs, outPathNorm, t, sec, uploadRoot);
    });
    const results = await Promise.all(tasks);
    const paths = results.filter((p): p is string => p !== null);
    if (paths.length === 0 && results.length > 0) {
      log.info("All frame extractions failed, trying single frame at 0.5s", { videoPath: videoPathAbs });
      const fallbackPath = path.join(outDirAbs, "thumb_1.jpg");
      const fallback = await extractOneFrame(
        videoPathNorm,
        fallbackPath,
        fallbackPath.replace(/\\/g, "/"),
        0.5,
        sec,
        uploadRoot
      );
      if (fallback) paths.push(fallback);
    }
    return paths;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("extractFrames failed", { videoPath: videoPathAbs, error: message });
    return [];
  }
}

async function createPlaceholderThumbnail(outDirAbs: string, uploadRoot: string): Promise<string> {
  const name = `thumb_placeholder_${randomUUID()}.svg`;
  const outPathAbs = path.join(outDirAbs, name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${THUMB_WIDTH}" height="180" viewBox="0 0 320 180">
    <rect fill="#1a1a1f" width="320" height="180"/>
    <g fill="none" stroke="#444" stroke-width="1.5">
      <path d="M120 70 L200 90 L120 110 Z"/>
      <circle cx="160" cy="90" r="28"/>
    </g>
    <text x="160" y="145" fill="#888" font-family="sans-serif" font-size="12" text-anchor="middle">No preview</text>
  </svg>`;
  await fs.writeFile(outPathAbs, svg, "utf8");
  return relativePath(uploadRoot, outPathAbs);
}

export async function setPrimaryThumbnail(
  videoId: number,
  thumbnailId: number
): Promise<Thumbnail | null> {
  return setPrimaryThumbnailDal(videoId, thumbnailId);
}

export async function listThumbnailsByVideoId(videoId: number): Promise<Thumbnail[]> {
  return findThumbnailsByVideoId(videoId);
}
