/** Converts a Date to ISO string */
export function toISO(date: Date): string {
  return date.toISOString();
}

/** Parses a date from a string or Date */
export function parseDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  return new Date();
}
