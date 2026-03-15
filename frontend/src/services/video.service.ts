/**
 * Video API: all backend calls for videos (upload, list, get, thumbnails).
 * Uses api (request, mediaUrl). Types from interfaces.
 */
import { request, mediaUrl } from "../api";
import { API_PATHS } from "../constants";
import type {
  UploadResponse,
  VideoDetail,
  ThumbnailOption,
  UploadPayload,
  ListVideosResponse,
} from "../interfaces";

export const videoService = {
  upload(file: File, payload: UploadPayload): Promise<UploadResponse> {
    const form = new FormData();
    form.set("video", file);
    form.set("title", payload.title);
    if (payload.description) form.set("description", payload.description);
    if (payload.tags) form.set("tags", payload.tags);
    return request<UploadResponse>(API_PATHS.VIDEOS, { method: "POST", body: form });
  },

  list(params: { title?: string; tag?: string; limit?: number; offset?: number } = {}): Promise<ListVideosResponse> {
    const q: Record<string, string> = {};
    if (params.title) q.title = params.title;
    if (params.tag) q.tag = params.tag;
    if (params.limit != null) q.limit = String(params.limit);
    if (params.offset != null) q.offset = String(params.offset);
    return request<ListVideosResponse>(API_PATHS.VIDEOS, { params: q });
  },

  getTags(params?: { top?: number }): Promise<{ tags: string[] }> {
    const q: Record<string, string> = {};
    if (params?.top != null) q.top = String(params.top);
    return request<{ tags: string[] }>(API_PATHS.TAGS, q.top ? { params: q } : undefined);
  },

  getById(id: string | number): Promise<VideoDetail> {
    return request<VideoDetail>(API_PATHS.VIDEO_BY_ID(id));
  },

  generateThumbnails(videoId: string | number): Promise<{ thumbnails: ThumbnailOption[] }> {
    return request<{ thumbnails: ThumbnailOption[] }>(
      API_PATHS.THUMBNAILS_GENERATE(videoId),
      { method: "POST" }
    );
  },

  selectThumbnail(videoId: string | number, thumbnailId: number): Promise<{ thumbnail: ThumbnailOption }> {
    return request<{ thumbnail: ThumbnailOption }>(
      API_PATHS.THUMBNAILS_SELECT(videoId),
      { method: "POST", body: JSON.stringify({ thumbnailId }) }
    );
  },

  mediaUrl,
};
