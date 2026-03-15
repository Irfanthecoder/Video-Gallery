export interface UploadResponse {
  videoId: number;
  title: string;
  description: string | null;
  tags: string[];
  createdAt: string;
}

export interface VideoMeta {
  id: number;
  title: string;
  description: string | null;
  tags: string[];
  createdAt: string;
  primaryThumbnailPath?: string | null;
}

export interface VideoDetail extends VideoMeta {
  filePath: string;
  thumbnails: ThumbnailOption[];
}

export interface ThumbnailOption {
  id: number;
  filePath: string;
  isPrimary: boolean;
}

export interface UploadPayload {
  title: string;
  description?: string;
  tags?: string;
}

export interface ListVideosResponse {
  videos: VideoMeta[];
  total: number;
}
