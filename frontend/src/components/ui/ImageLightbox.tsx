/**
 * Full-screen overlay to view an image larger. Max 90vw/90vh to avoid scrolling.
 */
import { useEffect } from "react";

interface ImageLightboxProps {
  src: string | null;
  onClose: () => void;
}

export function ImageLightbox({ src, onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!src) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="image-lightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="View image"
    >
      <div
        className="image-lightbox-content"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={src} alt="" className="image-lightbox-img" />
        <button
          type="button"
          className="image-lightbox-close"
          onClick={onClose}
          aria-label="Close"
          title="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
