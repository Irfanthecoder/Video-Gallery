export interface Thumbnail {
  id: number;
  video_id: number;
  file_path: string;
  is_primary?: boolean;
  created_at: Date;
}

export interface ThumbnailInsert {
  video_id: number;
  file_path: string;
  is_primary?: boolean;
}
