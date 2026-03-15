/** Default page size for list endpoints */
export const DEFAULT_LIST_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

/** Number of thumbnails to generate per video */
export const NUM_THUMBNAILS = 5;
export const THUMB_WIDTH = 320;
export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

/** Max lengths (align with safe DB usage; PostgreSQL TEXT has no built-in limit) */
export const TITLE_MAX_LENGTH = 70;
export const DESCRIPTION_MAX_LENGTH = 5000;
export const TAG_MIN_LENGTH = 3;
export const TAG_MAX_LENGTH = 20;
export const TAGS_MAX_COUNT = 15;

/** Max JSON body size for API (bytes) */
export const API_BODY_LIMIT = "500kb";

/** Max length for list query params (title search, tag filter) */
export const QUERY_SEARCH_MAX_LENGTH = 200;

/** Allowed MIME types for video uploads */
export const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
] as const;
