import type { Request, Response, NextFunction } from "express";
import { createLogger, sendError } from "../utils/index.js";
import { HTTP_STATUS, ERROR_MESSAGES, MESSAGE_CODES } from "../constants/index.js";

const log = createLogger("errorHandler");

/** Global handler: log error server-side, respond with safe user message only (no stack/technical details). */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const error = err instanceof Error ? err : new Error(String(err));
  log.error("Request error", { message: error.message, stack: error.stack });
  sendError(res, ERROR_MESSAGES.INTERNAL, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGE_CODES.INTERNAL_ERROR);
}
