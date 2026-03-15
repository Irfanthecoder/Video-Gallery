const PREFIX = "[video-gallery]";

/** Logger for the application */
export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    console.log(PREFIX, message, meta ?? "");
  },
  error(message: string, err?: unknown): void {
    console.error(PREFIX, message, err ?? "");
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(PREFIX, message, meta ?? "");
  },
};

/** Returns a logger that prefixes every message with [source] so we know where the log is from. */
export function createLogger(source: string): {
  info: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, err?: unknown) => void;
} {
  const prefix = `[${source}]`;
  return {
    info(message: string, meta?: Record<string, unknown>): void {
      logger.info(`${prefix} ${message}`, meta);
    },
    error(message: string, err?: unknown): void {
      logger.error(`${prefix} ${message}`, err);
    },
  };
}
