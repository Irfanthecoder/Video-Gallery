/**
 * Upload flow: form → upload → generate thumbnails → pick primary → view or back to gallery.
 * Edge cases: no file, validation error, upload fail, thumbnail generation fail (handled with messages).
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { videoService } from "../services";
import { PageTitle, UploadForm, ThumbnailGrid, Button, ImageLightbox } from "../components";
import { ROUTES } from "../constants";
import { validateUploadFields, trim, toUserFriendlyError, validateVideoFile } from "../utils";
import type { UploadFormValues, ThumbnailOption } from "../interfaces";

const initialFormValues: UploadFormValues = {
  title: "",
  description: "",
  tags: "",
};

export function UploadPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<UploadFormValues>(initialFormValues);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [videoId, setVideoId] = useState<number | null>(null);
  const [thumbnails, setThumbnails] = useState<ThumbnailOption[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Please select a video file.");
      return;
    }
    const title = trim(values.title);
    const description = trim(values.description);
    const validation = validateUploadFields(title, description, values.tags ?? "");
    if (validation) {
      setError(validation.error);
      return;
    }

    const isVideo = await validateVideoFile(file);
    if (!isVideo) {
      setError("The file is not a valid video. Please upload a real video file.");
      return;
    }

    setUploading(true);
    try {
      const tagsRaw = trim(values.tags ?? "");
      const res = await videoService.upload(file, {
        title,
        description: description || undefined,
        tags: tagsRaw || undefined,
      });
      setVideoId(res.videoId);

      setGenerating(true);
      try {
        const { thumbnails: thumbs } = await videoService.generateThumbnails(res.videoId);
        setThumbnails(thumbs);
      } catch {
        setError("Upload succeeded but thumbnail generation failed.");
      } finally {
        setGenerating(false);
      }
    } catch (err) {
      setError(toUserFriendlyError(err instanceof Error ? err.message : "Upload failed."));
    } finally {
      setUploading(false);
    }
  };

  const handleSelectThumbnail = async (thumbnailId: number) => {
    if (videoId == null) return;
    setSelectingId(thumbnailId);
    try {
      const { thumbnail } = await videoService.selectThumbnail(videoId, thumbnailId);
      setThumbnails((prev) =>
        prev.map((t) => ({ ...t, isPrimary: t.id === thumbnail.id }))
      );
    } finally {
      setSelectingId(null);
    }
  };

  const goToGallery = () => navigate(ROUTES.HOME);
  const goToDetail = () => videoId != null && navigate(ROUTES.VIDEO_DETAIL(videoId));

  return (
    <motion.div
      className="upload-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageTitle>Upload video</PageTitle>

      {!videoId ? (
        <UploadForm
          values={values}
          onChange={setValues}
          file={file}
          onFileChange={setFile}
          onSubmit={handleSubmit}
          submitting={uploading}
          error={error}
        />
      ) : (
        <div className="after-upload">
          <p className="success-msg">Video uploaded. Choose a primary thumbnail below.</p>
          {generating && <p className="muted">Generating thumbnails…</p>}
          {thumbnails.length > 0 && (
            <ThumbnailGrid
              thumbnails={thumbnails}
              onSelect={handleSelectThumbnail}
              selectingId={selectingId}
              onExpandImage={setLightboxSrc}
            />
          )}
          <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
          <div className="after-upload-actions">
            <Button variant="secondary" onClick={goToGallery}>
              Back to gallery
            </Button>
            <Button onClick={goToDetail}>View video</Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
