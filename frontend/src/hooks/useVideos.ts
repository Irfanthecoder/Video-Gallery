/**
 * Fetches gallery videos from API and syncs with store.
 * Refetches when filters or page change. Used by GalleryPage.
 */
import { useState, useEffect } from "react";
import { videoService } from "../services";
import { useVideoStore } from "../store";
import { toUserFriendlyError } from "../utils";
import type { UseVideosResult } from "../interfaces";

export function useVideos(page: number, pageSize: number): UseVideosResult {
  const { videos, total, filters, setVideos, setTotal } = useVideoStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const { filters: currentFilters } = useVideoStore.getState();
      const title = currentFilters.titleSearch?.trim() || undefined;
      const tag = currentFilters.tagFilter?.trim() || undefined;
      const res = await videoService.list({
        title,
        tag,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      setVideos(res.videos);
      setTotal(res.total);
    } catch (e) {
      setError(toUserFriendlyError(e instanceof Error ? e.message : "Failed to load videos"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [filters.titleSearch, filters.tagFilter, page, pageSize]);

  return { videos, total, loading, error, refetch: fetchVideos };
}
