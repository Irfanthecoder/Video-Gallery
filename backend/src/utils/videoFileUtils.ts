/**
 * Checks that a file is a real video using ffprobe (not just extension/MIME).
 * Rejects renamed non-video files (e.g. file.txt renamed to file.mp4).
 */
import path from "path";
import fs from "fs/promises";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfprobePath(ffprobeInstaller.path);

interface ProbeFormat {
  duration?: number;
  format_name?: string;
}

interface ProbeStream {
  codec_type?: string;
}

interface ProbeData {
  format?: ProbeFormat;
  streams?: ProbeStream[];
}

/**
 * Returns true if the file exists and ffprobe detects a valid video (has video stream or format duration).
 * Returns false if file is missing, not readable, or not a valid video.
 */
export async function isValidVideoFile(filePathAbs: string): Promise<boolean> {
  const normalized = path.resolve(filePathAbs).replace(/\\/g, "/");
  try {
    await fs.access(normalized);
  } catch {
    return false;
  }

  return new Promise<boolean>((resolve) => {
    ffmpeg(normalized).ffprobe((err: Error | null, data: ProbeData) => {
      if (err) {
        resolve(false);
        return;
      }
      const hasVideoStream =
        data?.streams?.some((s) => s.codec_type === "video") ?? false;
      const hasFormatDuration =
        data?.format?.duration != null && Number(data.format.duration) >= 0;
      resolve(hasVideoStream || hasFormatDuration);
    });
  });
}
