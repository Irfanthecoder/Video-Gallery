import type { VideoMeta, VideoDetail } from "./video.types";

export interface UseVideosResult {
  videos: VideoMeta[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseVideoDetailResult {
  video: VideoDetail | null;
  loading: boolean;
  error: string | null;
}
