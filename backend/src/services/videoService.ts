import {
  createVideo as createVideoDal,
  findVideoById,
  findVideos,
  findDistinctTags,
  findTopTags,
  findThumbnailsByVideoId,
} from "../dal/index.js";
import type { Video, VideoInsert, FindVideosFilter } from "../interfaces/index.js";

export async function createVideo(row: VideoInsert): Promise<Video> {
  return createVideoDal(row);
}

export async function getVideoById(id: number): Promise<Video | null> {
  return findVideoById(id);
}

export async function listVideos(
  filters: FindVideosFilter,
  limit: number,
  offset: number
): Promise<{ videos: Array<Video & { primaryThumbnailPath: string | null }>; total: number }> {
  const { videos, total } = await findVideos(filters, limit, offset);
  const withThumbnails = await Promise.all(
    videos.map(async (v) => {
      const thumbs = await findThumbnailsByVideoId(v.id);
      const primary = thumbs.find((t) => t.is_primary) ?? thumbs[0];
      return {
        ...v,
        primaryThumbnailPath: primary?.file_path ?? null,
      };
    })
  );
  return { videos: withThumbnails, total };
}

export async function getTags(opts?: { top?: number }): Promise<string[]> {
  if (opts?.top != null && opts.top > 0) {
    return findTopTags(opts.top);
  }
  return findDistinctTags();
}
