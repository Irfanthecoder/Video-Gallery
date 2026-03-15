export interface Video {
  id: number;
  title: string;
  description?: string | null;
  file_path: string;
  tags: string[];
  created_at: Date;
}

export interface VideoInsert {
  title: string;
  description?: string | null;
  file_path: string;
  tags: string[];
}

export interface FindVideosFilter {
  titleSearch?: string;
  tagFilter?: string;
}

// Request/response shapes for video validation (upload body, select thumbnail)
export interface UploadVideoBody {
  title: string;
  description: string | null;
  tags: string[];
}

export interface ValidateUploadResult {
  success: true;
  data: UploadVideoBody;
}

export interface ValidateUploadError {
  success: false;
  error: string;
}

export type ValidateUploadResponse = ValidateUploadResult | ValidateUploadError;

export interface ValidateSelectThumbnailResult {
  thumbnailId: number;
}

export interface ValidateSelectThumbnailError {
  error: string;
}

export type ValidateSelectThumbnailResponse =
  | ValidateSelectThumbnailResult
  | ValidateSelectThumbnailError;
