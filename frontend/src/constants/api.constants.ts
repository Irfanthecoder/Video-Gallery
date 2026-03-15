/** Backend base URL and path helpers (no UI). */
export const API_BASE = "";

export const API_PATHS = {
  VIDEOS: "/api/videos",
  TAGS: "/api/videos/tags",
  VIDEO_BY_ID: (id: string | number) => `/api/videos/${id}`,
  THUMBNAILS_GENERATE: (id: string | number) => `/api/videos/${id}/thumbnails/generate`,
  THUMBNAILS_SELECT: (id: string | number) => `/api/videos/${id}/thumbnails/select`,
} as const;

export const UPLOAD_PATH_PREFIX = "/uploads/";
