/** App routes and patterns for React Router. */
export const ROUTES = {
  HOME: "/",
  UPLOAD: "/upload",
  VIDEO_DETAIL: (id: string | number) => `/videos/${id}`,
} as const;

export const VIDEO_DETAIL_PATTERN = "/videos/:id";
