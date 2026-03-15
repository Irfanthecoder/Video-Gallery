/**
 * Gallery state: video list + title/tag filters.
 * useVideos writes videos here; GalleryPage reads videos + filters.
 */
import { create } from "zustand";
import type { GalleryFilters, VideoState } from "../interfaces";

const defaultFilters: GalleryFilters = {
  titleSearch: "",
  tagFilter: "",
};

export const useVideoStore = create<VideoState>((set) => ({
  videos: [],
  total: 0,
  filters: defaultFilters,
  setVideos: (videos) => set({ videos }),
  setTotal: (total) => set({ total }),
  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
