import type { VideoMeta } from "./video.types";

export interface GalleryFilters {
  titleSearch: string;
  tagFilter: string;
}

export interface VideoState {
  videos: VideoMeta[];
  total: number;
  filters: GalleryFilters;
  setVideos: (videos: VideoMeta[]) => void;
  setTotal: (total: number) => void;
  setFilters: (filters: Partial<GalleryFilters>) => void;
  resetFilters: () => void;
}
