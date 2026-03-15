import type { Response } from "express";
import { HTTP_STATUS, MESSAGE_CODES, API_SUCCESS_MESSAGES } from "../constants/index.js";

export interface ApiResponse<T = unknown> {
  messageCode: string;
  message: string;
  data: T | null;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = HTTP_STATUS.OK,
  messageCode: keyof typeof API_SUCCESS_MESSAGES = MESSAGE_CODES.SUCCESS
): void {
  const message = API_SUCCESS_MESSAGES[messageCode as keyof typeof API_SUCCESS_MESSAGES] ?? "Success";
  const payload: ApiResponse<T> = { messageCode, message, data };
  res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  messageCode: string = MESSAGE_CODES.INTERNAL_ERROR
): void {
  const payload: ApiResponse<null> = { messageCode, message, data: null };
  res.status(statusCode).json(payload);
}
