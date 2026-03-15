/** HTTP status codes for API responses */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/** User-facing error messages (no technical details or stack traces) */
export const ERROR_MESSAGES = {
  NO_VIDEO_FILE: "Please upload a video file.",
  TITLE_REQUIRED: "Please enter a title.",
  VIDEO_NOT_FOUND: "Video not found.",
  THUMBNAIL_ID_REQUIRED: "Please select a thumbnail.",
  THUMBNAIL_OR_VIDEO_NOT_FOUND: "Thumbnail or video not found.",
  SAVE_VIDEO_METADATA: "We couldn't save your video. Please try again.",
  GENERATE_THUMBNAILS: "We couldn't generate thumbnails. Please try again.",
  ONLY_VIDEO_FILES: "Only video files are allowed.",
  INVALID_VIDEO_FILE: "The file is not a valid video. Please upload a real video file",
  INTERNAL: "Something went wrong. Please try again.",
  TITLE_TOO_LONG: "Title is too long.",
  DESCRIPTION_TOO_LONG: "Description is too long.",
  TAG_TOO_SHORT: "Each tag must be at least 3 characters.",
  TAG_TOO_LONG: "Each tag must be at most 20 characters.",
  TAG_DUPLICATE: "That tag is already added.",
  TOO_MANY_TAGS: "Too many tags.",
} as const;

/** User-facing success messages (optional, for responses that benefit from a message) */
export const SUCCESS_MESSAGES = {
  VIDEO_UPLOADED: "Video uploaded successfully.",
  THUMBNAILS_GENERATED: "Thumbnails ready.",
  THUMBNAIL_SELECTED: "Primary thumbnail updated.",
} as const;

/** API response message codes (same structure for all success and error responses) */
export const MESSAGE_CODES = {
  SUCCESS: "SUCCESS",
  TAGS_FETCHED: "TAGS_FETCHED",
  VIDEOS_FETCHED: "VIDEOS_FETCHED",
  VIDEO_UPLOADED: "VIDEO_UPLOADED",
  VIDEO_FETCHED: "VIDEO_FETCHED",
  THUMBNAILS_GENERATED: "THUMBNAILS_GENERATED",
  THUMBNAIL_SELECTED: "THUMBNAIL_SELECTED",
  BAD_REQUEST: "BAD_REQUEST",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

/** Single source of truth: message text for each success messageCode */
export const API_SUCCESS_MESSAGES = {
  [MESSAGE_CODES.SUCCESS]: "Success",
  [MESSAGE_CODES.TAGS_FETCHED]: "Tags fetched successfully",
  [MESSAGE_CODES.VIDEOS_FETCHED]: "Videos fetched successfully",
  [MESSAGE_CODES.VIDEO_UPLOADED]: SUCCESS_MESSAGES.VIDEO_UPLOADED,
  [MESSAGE_CODES.VIDEO_FETCHED]: "Video fetched successfully",
  [MESSAGE_CODES.THUMBNAILS_GENERATED]: SUCCESS_MESSAGES.THUMBNAILS_GENERATED,
  [MESSAGE_CODES.THUMBNAIL_SELECTED]: SUCCESS_MESSAGES.THUMBNAIL_SELECTED,
} as const;
