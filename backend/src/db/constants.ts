/** Table names – single source of truth for DB layer */
export const TABLE_VIDEOS = "videos";
export const TABLE_THUMBNAILS = "thumbnails";

/** Default select columns per table */
export const COLS_VIDEOS = "id, title, description, file_path, tags, created_at";
export const COLS_THUMBNAILS = "id, video_id, file_path, is_primary, created_at";
