import Joi from "joi";
import type {
  ValidateUploadResult,
  ValidateUploadError,
  ValidateSelectThumbnailResult,
  ValidateSelectThumbnailError,
} from "../interfaces/index.js";
import {
  ERROR_MESSAGES,
  TITLE_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  TAG_MIN_LENGTH,
  TAG_MAX_LENGTH,
  TAGS_MAX_COUNT,
} from "../constants/index.js";
import { parseTags } from "../utils/index.js";

const uploadBodySchema = Joi.object({
  title: Joi.string()
    .trim()
    .required()
    .max(TITLE_MAX_LENGTH)
    .messages({
      "string.empty": ERROR_MESSAGES.TITLE_REQUIRED,
      "any.required": ERROR_MESSAGES.TITLE_REQUIRED,
      "string.max": ERROR_MESSAGES.TITLE_TOO_LONG,
    }),
  description: Joi.string()
    .trim()
    .allow("", null)
    .max(DESCRIPTION_MAX_LENGTH)
    .messages({ "string.max": ERROR_MESSAGES.DESCRIPTION_TOO_LONG }),
  tags: Joi.array()
    .items(
      Joi.string()
        .trim()
        .min(TAG_MIN_LENGTH)
        .max(TAG_MAX_LENGTH)
        .messages({
          "string.min": ERROR_MESSAGES.TAG_TOO_SHORT,
          "string.max": ERROR_MESSAGES.TAG_TOO_LONG,
        })
    )
    .max(TAGS_MAX_COUNT)
    .unique()
    .messages({
      "array.max": ERROR_MESSAGES.TOO_MANY_TAGS,
      "array.unique": ERROR_MESSAGES.TAG_DUPLICATE,
    }),
});

const selectThumbnailSchema = Joi.object({
  thumbnailId: Joi.number().integer().min(1).required().messages({
    "number.base": ERROR_MESSAGES.THUMBNAIL_ID_REQUIRED,
    "any.required": ERROR_MESSAGES.THUMBNAIL_ID_REQUIRED,
    "number.min": ERROR_MESSAGES.THUMBNAIL_ID_REQUIRED,
  }),
});


export function validateUploadBody(
  body: Record<string, unknown>,
  file?: Express.Multer.File
): ValidateUploadResult | ValidateUploadError {
  if (!file) return { success: false, error: ERROR_MESSAGES.NO_VIDEO_FILE };

  const payload = {
    title: String(body?.title ?? "").trim(),
    description: body?.description != null ? String(body.description).trim() : null,
    tags: parseTags(body?.tags),
  };

  const { error, value } = uploadBodySchema.validate(payload, { abortEarly: true });
  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: {
      title: value.title,
      description: value.description === "" ? null : value.description,
      tags: value.tags,
    },
  };
}

export function validateSelectThumbnailBody(
  body: Record<string, unknown> | null | undefined
): ValidateSelectThumbnailResult | ValidateSelectThumbnailError {
  const raw = body?.thumbnailId ?? body?.id;
  const num = raw != null ? Number(raw) : NaN;
  const { error, value } = selectThumbnailSchema.validate(
    { thumbnailId: Number.isInteger(num) && num >= 1 ? num : raw },
    { abortEarly: true }
  );
  if (error) return { error: error.message };
  return { thumbnailId: value.thumbnailId };
}
