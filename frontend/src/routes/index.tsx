/**
 * Route config: layout wraps Gallery, Upload, Video detail. Paths from constants.
 */
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../layouts";
import { GalleryPage, UploadPage, VideoDetailPage, NotFoundPage } from "../pages";
import { ROUTES, VIDEO_DETAIL_PATTERN } from "../constants";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<GalleryPage />} />
        <Route path={ROUTES.UPLOAD} element={<UploadPage />} />
        {/* /videos/tags must come before /videos/:id so "tags" is not treated as a video id */}
        <Route path="/videos/tags" element={<Navigate to={ROUTES.HOME} replace />} />
        <Route path={VIDEO_DETAIL_PATTERN} element={<VideoDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
