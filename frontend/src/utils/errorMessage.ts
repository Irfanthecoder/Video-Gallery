const GENERIC_MESSAGE = "Something went wrong. Please try again.";

/** Patterns that indicate a technical/system error */
const TECHNICAL_PATTERNS = [
  /\bECONNRESET\b/i,
  /\bECONNREFUSED\b/i,
  /\bENOENT\b/i,
  /\bETIMEDOUT\b/i,
  /\bcolumn\s+["']?\w+["']?\s+does not exist/i,
  /\bvariable\s+["']?\w+["']?\s+does not exist/i,
  /\bcannot be NaN\b/i,
  /\bundefined\b/i,
  /\bnull is not\b/i,
  /\bat\s+Object\./i,
  /\bat\s+Module\./i,
  /\.ts:\d+/i,
  /\.js:\d+/i,
  /\bSyntaxError\b/i,
  /\bTypeError\b/i,
  /\bReferenceError\b/i,
  /\bNetworkError\b/i,
  /Failed to fetch/i,
  /Load failed/i,
];

/**
 * Returns a user-safe error message. If the message looks like a technical
 * or programming error, returns a generic message instead so we never
 * expose stack traces, DB errors, or runtime messages.
 */
export function toUserFriendlyError(message: string | undefined | null): string {
  const str = (message ?? "").trim();
  if (!str) return GENERIC_MESSAGE;
  const looksTechnical = TECHNICAL_PATTERNS.some((re) => re.test(str));
  return looksTechnical ? GENERIC_MESSAGE : str;
}
