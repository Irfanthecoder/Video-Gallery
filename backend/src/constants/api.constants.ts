export const API_PREFIX = "/api";
export const VIDEOS_PATH = "/videos";
export const VIDEOS_BASE = `${API_PREFIX}${VIDEOS_PATH}`;

/** Route path segments (router is mounted at VIDEOS_BASE). Define /tags before /:id. */
export const ROUTE_VIDEOS_LIST = "/";
export const ROUTE_TAGS = "/tags";
export const ROUTE_VIDEO_BY_ID = "/:id";
export const ROUTE_THUMBNAILS_GENERATE = "/:id/thumbnails/generate";
export const ROUTE_THUMBNAILS_SELECT = "/:id/thumbnails/select";
