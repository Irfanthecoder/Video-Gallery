import type { Request, Response } from "express";
import { videoService, thumbnailService } from "../services/index.js";
import { config } from "../config/index.js";
import path from "path";
import fs from "fs/promises";
import { sendSuccess, sendError, toISO, relativePath, normalizePagination, createLogger, isValidVideoFile } from "../utils/index.js";
import { validateUploadBody, validateSelectThumbnailBody } from "../validations/index.js";
import { HTTP_STATUS, ERROR_MESSAGES, QUERY_SEARCH_MAX_LENGTH, MESSAGE_CODES } from "../constants/index.js";

const log = createLogger("videoController");

/** Parse :id route param to positive integer; returns null if invalid. */
function parseIdParam(param: string | undefined): number | null {
  const n = param != null ? parseInt(param, 10) : NaN;
  return Number.isInteger(n) && n >= 1 ? n : null;
}

export async function getTags(req: Request, res: Response): Promise<void> {
  const top = req.query.top != null ? Number(req.query.top) : undefined;
  const tags = await videoService.getTags({ top });
  sendSuccess(res, { tags }, HTTP_STATUS.OK, MESSAGE_CODES.TAGS_FETCHED);
}

export async function uploadVideo(req: Request, res: Response): Promise<void> {
  const validation = validateUploadBody(req.body, req.file);
  if (!validation.success) {
    sendError(res, validation.error, HTTP_STATUS.BAD_REQUEST, MESSAGE_CODES.BAD_REQUEST);
    return;
  }

  const uploadedPath = req.file!.path;
  const filePathAbs = path.resolve(uploadedPath);

  const valid = await isValidVideoFile(filePathAbs);
  if (!valid) {
    try {
      await fs.unlink(filePathAbs);
    } catch (e) {
      log.error("Could not delete invalid upload", { path: filePathAbs, err: e });
    }
    sendError(res, ERROR_MESSAGES.INVALID_VIDEO_FILE, HTTP_STATUS.BAD_REQUEST, MESSAGE_CODES.BAD_REQUEST);
    return;
  }

  const filePath = relativePath(config.uploadDirAbs, uploadedPath);

  try {
    const video = await videoService.createVideo({
      title: validation.data.title,
      description: validation.data.description,
      file_path: filePath,
      tags: validation.data.tags,
    });
    log.info("Video uploaded", { videoId: video.id, title: video.title });
    sendSuccess(res, {
      videoId: video.id,
      title: video.title,
      description: video.description,
      tags: video.tags,
      createdAt: toISO(video.created_at),
    }, HTTP_STATUS.CREATED, MESSAGE_CODES.VIDEO_UPLOADED);
  } catch (err) {
    log.error(ERROR_MESSAGES.SAVE_VIDEO_METADATA, err);
    sendError(res, ERROR_MESSAGES.SAVE_VIDEO_METADATA, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGE_CODES.INTERNAL_ERROR);
  }
}

export async function getVideo(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req.params?.id);
  if (id === null) {
    sendError(res, ERROR_MESSAGES.VIDEO_NOT_FOUND, HTTP_STATUS.BAD_REQUEST, MESSAGE_CODES.BAD_REQUEST);
    return;
  }
  const video = await videoService.getVideoById(id);
  if (!video) {
    sendError(res, ERROR_MESSAGES.VIDEO_NOT_FOUND, HTTP_STATUS.NOT_FOUND, MESSAGE_CODES.NOT_FOUND);
    return;
  }
  const thumbnails = await thumbnailService.listThumbnailsByVideoId(video.id);
  log.info("Video fetched", { videoId: id });
  sendSuccess(res, {
    id: video.id,
    title: video.title,
    description: video.description,
    tags: video.tags,
    filePath: video.file_path,
    createdAt: toISO(video.created_at),
    thumbnails: thumbnails.map((t) => ({
      id: t.id,
      filePath: t.file_path,
      isPrimary: t.is_primary,
    })),
  }, HTTP_STATUS.OK, MESSAGE_CODES.VIDEO_FETCHED);
}

export async function listVideos(req: Request, res: Response): Promise<void> {
  const rawTitle = (req.query?.title as string | undefined)?.trim?.();
  const rawTag = (req.query?.tag as string | undefined)?.trim?.();
  const titleSearch = rawTitle?.slice(0, QUERY_SEARCH_MAX_LENGTH) ?? undefined;
  const tagFilter = rawTag?.slice(0, QUERY_SEARCH_MAX_LENGTH) ?? undefined;
  const { limit, offset } = normalizePagination({
    limit: req.query?.limit,
    offset: req.query?.offset,
  });

  const { videos, total } = await videoService.listVideos(
    { titleSearch, tagFilter },
    limit,
    offset
  );
  log.info("Videos listed", { count: videos.length, total, limit, offset });

  sendSuccess(res, {
    videos: videos.map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      tags: v.tags,
      createdAt: toISO(v.created_at),
      primaryThumbnailPath: v.primaryThumbnailPath ?? null,
    })),
    total,
  }, HTTP_STATUS.OK, MESSAGE_CODES.VIDEOS_FETCHED);
}

export async function generateThumbnails(req: Request, res: Response): Promise<void> {
  const videoId = parseIdParam(req.params?.id);
  if (videoId === null) {
    sendError(res, ERROR_MESSAGES.VIDEO_NOT_FOUND, HTTP_STATUS.BAD_REQUEST, MESSAGE_CODES.BAD_REQUEST);
    return;
  }
  const video = await videoService.getVideoById(videoId);
  if (!video) {
    sendError(res, ERROR_MESSAGES.VIDEO_NOT_FOUND, HTTP_STATUS.NOT_FOUND, MESSAGE_CODES.NOT_FOUND);
    return;
  }

  const videoPath = path.resolve(config.uploadDirAbs, video.file_path);

  try {
    const thumbnails = await thumbnailService.generateThumbnails(video.id, videoPath);
    log.info("Thumbnails generated", { videoId, count: thumbnails.length });
    sendSuccess(res, {
      thumbnails: thumbnails.map((t) => ({
        id: t.id,
        filePath: t.file_path,
        isPrimary: t.is_primary,
      })),
    }, HTTP_STATUS.OK, MESSAGE_CODES.THUMBNAILS_GENERATED);
  } catch (err) {
    log.error(ERROR_MESSAGES.GENERATE_THUMBNAILS, err);
    sendError(res, ERROR_MESSAGES.GENERATE_THUMBNAILS, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGE_CODES.INTERNAL_ERROR);
  }
}

export async function selectThumbnail(req: Request, res: Response): Promise<void> {
  const videoId = parseIdParam(req.params?.id);
  if (videoId === null) {
    sendError(res, ERROR_MESSAGES.VIDEO_NOT_FOUND, HTTP_STATUS.BAD_REQUEST, MESSAGE_CODES.BAD_REQUEST);
    return;
  }
  const validated = validateSelectThumbnailBody(req.body);
  if ("error" in validated) {
    sendError(res, validated.error, HTTP_STATUS.BAD_REQUEST, MESSAGE_CODES.BAD_REQUEST);
    return;
  }

  const updated = await thumbnailService.setPrimaryThumbnail(videoId, validated.thumbnailId);
  if (!updated) {
    sendError(res, ERROR_MESSAGES.THUMBNAIL_OR_VIDEO_NOT_FOUND, HTTP_STATUS.NOT_FOUND, MESSAGE_CODES.NOT_FOUND);
    return;
  }
  log.info("Primary thumbnail set", { videoId, thumbnailId: validated.thumbnailId });
  sendSuccess(res, {
    thumbnail: {
      id: updated.id,
      filePath: updated.file_path,
      isPrimary: updated.is_primary,
    },
  }, HTTP_STATUS.OK, MESSAGE_CODES.THUMBNAIL_SELECTED);
}
