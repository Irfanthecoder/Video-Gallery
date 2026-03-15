/**
 * Grid of thumbnail options after upload; user clicks to set primary.
 * Disables buttons while a selection is in progress (selectingId).
 */
import { motion } from "framer-motion";
import { videoService } from "../../services";
import type { ThumbnailOption } from "../../interfaces";

interface ThumbnailGridProps {
  thumbnails: ThumbnailOption[];
  onSelect: (thumbnailId: number) => void;
  selectingId: number | null;
  onExpandImage?: (src: string) => void;
}

export function ThumbnailGrid({ thumbnails, onSelect, selectingId, onExpandImage }: ThumbnailGridProps) {
  return (
    <motion.div
      className="thumbnail-grid"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ staggerChildren: 0.06 }}
    >
      {thumbnails.map((t, i) => (
        <motion.div
          key={t.id}
          role="button"
          tabIndex={0}
          aria-label={`Set as primary thumbnail${t.isPrimary ? " (current primary)" : ""}`}
          aria-disabled={selectingId !== null}
          className={`thumb-card ${t.isPrimary ? "primary" : ""} ${selectingId !== null ? "disabled" : ""}`}
          onClick={() => selectingId === null && onSelect(t.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (selectingId === null) onSelect(t.id);
            }
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <span className="thumb-card-img-wrap">
            <img src={videoService.mediaUrl(t.filePath)} alt={`Thumbnail ${i + 1}`} />
            {onExpandImage && (
              <button
                type="button"
                className="thumb-card-view-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onExpandImage(videoService.mediaUrl(t.filePath));
                }}
                aria-label="View larger"
                title="View larger"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            )}
          </span>
          {t.isPrimary && <span className="badge">Primary</span>}
        </motion.div>
      ))}
    </motion.div>
  );
}
