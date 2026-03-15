export function formatDate(iso: string, options?: Intl.DateTimeFormatOptions): string {
  const opts = options ?? {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(iso).toLocaleDateString(undefined, opts);
}

export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
