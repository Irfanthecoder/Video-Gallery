/**
 * Client-side validation for upload form (title/description/tags limits).
 * Backend validates again; this avoids unnecessary round-trips.
 */
import { TITLE_MAX_LENGTH, DESCRIPTION_MAX_LENGTH, TAG_MIN_LENGTH, TAG_MAX_LENGTH, TAGS_MAX_COUNT } from "../constants";
import type { UploadValidationError } from "../interfaces";

export function trim(value: unknown): string {
  return String(value ?? "").trim();
}

export function parseTags(value: unknown): string[] {
  const raw = value != null ? String(value) : "";
  return raw
    .split(",")
    .map((s) => s?.trim?.() ?? "")
    .filter(Boolean);
}

export function validateUploadFields(
  title: string,
  description: string,
  tagsRaw: string
): null | UploadValidationError {
  const t = trim(title);
  if (!t) return { error: "Title is required." };
  if (t.length > TITLE_MAX_LENGTH) {
    return { error: `Title must be at most ${TITLE_MAX_LENGTH} characters.` };
  }
  const desc = trim(description);
  if (desc.length > DESCRIPTION_MAX_LENGTH) {
    return { error: `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters.` };
  }
  const tags = parseTags(tagsRaw);
  if (tags.length > TAGS_MAX_COUNT) {
    return { error: `At most ${TAGS_MAX_COUNT} tags allowed.` };
  }
  const seen = new Set<string>();
  for (const tag of tags) {
    if (tag.length < TAG_MIN_LENGTH) {
      return { error: `Each tag must be at least ${TAG_MIN_LENGTH} characters.` };
    }
    if (tag.length > TAG_MAX_LENGTH) {
      return { error: `Each tag must be at most ${TAG_MAX_LENGTH} characters.` };
    }
    if (seen.has(tag)) {
      return { error: "That tag is already added." };
    }
    seen.add(tag);
  }
  return null;
}
