/**
 * Upload form: title, description, tags (comma-separated), file input.
 * Controlled via values/onChange; validation is done in UploadPage before submit.
 */
import { useRef } from "react";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { TagInput } from "../ui/TagInput";
import { TITLE_MAX_LENGTH, DESCRIPTION_MAX_LENGTH } from "../../constants";
import type { UploadFormValues } from "../../interfaces";

interface UploadFormProps {
  values: UploadFormValues;
  onChange: (values: UploadFormValues) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string | null;
}

const ACCEPT_VIDEO = "video/mp4,video/webm,video/quicktime";

export function UploadForm({
  values,
  onChange,
  file,
  onFileChange,
  onSubmit,
  submitting,
  error,
}: UploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={onSubmit} className="upload-form">
      <Input
        label="Title *"
        type="text"
        value={values.title}
        onChange={(e) => onChange({ ...values, title: (e.target.value ?? "").slice(0, TITLE_MAX_LENGTH) })}
        placeholder="Video title"
        required
        disabled={submitting}
        maxLength={TITLE_MAX_LENGTH}
        showCharCount={TITLE_MAX_LENGTH}
      />
      <Textarea
        label="Description"
        value={values.description}
        onChange={(e) => onChange({ ...values, description: (e.target.value ?? "").slice(0, DESCRIPTION_MAX_LENGTH) })}
        placeholder="Optional description"
        rows={3}
        disabled={submitting}
        maxLength={DESCRIPTION_MAX_LENGTH}
        showCharCount={DESCRIPTION_MAX_LENGTH}
      />
      <TagInput
        value={values.tags}
        onChange={(tagsValue) => onChange({ ...values, tags: tagsValue })}
        disabled={submitting}
        placeholder="Type and press Enter or comma"
      />
      <div className="form-group">
        <label>Video file *</label>
        <div className="file-input-wrap">
          <label
            className={`file-input-label ${submitting ? "disabled" : ""}`}
            htmlFor="video-file-input"
          >
            {file ? "Change video" : "Choose video file"}
          </label>
          <input
            id="video-file-input"
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_VIDEO}
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            disabled={submitting}
          />
        </div>
        {file && <span className="file-name">{file.name}</span>}
      </div>
      {error && <p className="form-error">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Uploading…" : "Upload"}
      </Button>
    </form>
  );
}
