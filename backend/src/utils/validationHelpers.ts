/** Trim and return string; never throws. */
export function trimString(value: unknown): string {
  return String(value ?? "").trim();
}

/** Parse comma-separated tags, trim each, filter empty. */
export function parseTags(value: unknown): string[] {
  const raw = value != null ? String(value) : "";
  return raw
    .split(",")
    .map((s) => s?.trim?.() ?? "")
    .filter(Boolean);
}

/** Trim and return null if empty. */
export function optionalString(value: unknown): string | null {
  const s = trimString(value);
  return s === "" ? null : s;
}

/** Check length; returns error message if exceeded. */
export function checkMaxLength(
  value: string,
  max: number,
  label: string
): string | null {
  if (value.length <= max) return null;
  return `${label} exceeds maximum length (${max} characters)`;
}
