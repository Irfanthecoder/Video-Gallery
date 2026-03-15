/**
 * Single video: player, title, date, description, tags, thumbnails.
 * useVideoDetail(id) loads data; loading and not-found handled here.
 */
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useVideoDetail } from "../hooks";
import { videoService } from "../services";
import { ROUTES } from "../constants";
import { formatDateLong } from "../utils";
import { ImageLightbox } from "../components";

export function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { video, loading, error } = useVideoDetail(id);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  if (loading) return <p className="muted">Loading…</p>;
  if (error || !video) return <p className="form-error">{error ?? "Video not found."}</p>;

  const videoUrl = videoService.mediaUrl(video.filePath);
  const primaryThumb = video.thumbnails.find((t) => t.isPrimary);

  return (
    <motion.div
      className="detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="detail-toolbar">
        <Link to={ROUTES.HOME} className="detail-back-link">← Back to gallery</Link>
      </div>

      <section className="detail-video-section" aria-label="Video player">
        <div className="detail-player-wrap">
          <video
            src={videoUrl}
            controls
            className="detail-player"
            poster={primaryThumb ? videoService.mediaUrl(primaryThumb.filePath) : undefined}
          />
        </div>
      </section>

      <div className="detail-content">
        <header className="detail-meta">
          <h1 className="detail-title">{video.title}</h1>
          <time dateTime={video.createdAt} className="detail-date">
            {formatDateLong(video.createdAt)}
          </time>
          {video.description && (
            <p className="detail-description">{video.description}</p>
          )}
          {video.tags.length > 0 && (
            <div className="detail-tags">
              {video.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          )}
        </header>

        {video.thumbnails.length > 0 && (
          <section className="detail-thumbnails" aria-labelledby="detail-thumbnails-heading">
            <h2 id="detail-thumbnails-heading" className="detail-section-title">Thumbnails</h2>
            <div className="detail-thumb-grid">
              {video.thumbnails.map((t) => (
                <div
                  key={t.id}
                  className={`detail-thumb ${t.isPrimary ? "primary" : ""}`}
                >
                  <img
                    src={videoService.mediaUrl(t.filePath)}
                    alt=""
                    onClick={() => setLightboxSrc(videoService.mediaUrl(t.filePath))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setLightboxSrc(videoService.mediaUrl(t.filePath));
                      }
                    }}
                    aria-label="View larger"
                  />
                  {t.isPrimary && <span className="badge">Primary</span>}
                </div>
              ))}
            </div>
          </section>
        )}
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      </div>
    </motion.div>
  );
}
