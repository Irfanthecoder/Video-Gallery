/**
 * Fetches a single video by id. Handles loading, error, and unmount (cancelled).
 * Used by VideoDetailPage.
 */
import { useState, useEffect } from "react";
import { videoService } from "../services";
import { toUserFriendlyError } from "../utils";
import type { UseVideoDetailResult } from "../interfaces";

export function useVideoDetail(id: string | undefined): UseVideoDetailResult {
  const [video, setVideo] = useState<UseVideoDetailResult["video"]>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setVideo(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    videoService
      .getById(id)
      .then((v) => {
        if (!cancelled) setVideo(v);
      })
      .catch((e) => {
        if (!cancelled) setError(toUserFriendlyError(e instanceof Error ? e.message : "Failed to load"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { video, loading, error };
}
