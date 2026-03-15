/**
 * Gallery list item: thumbnail (or placeholder), title, date. Links to video detail.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { videoService } from "../../services";
import { ROUTES } from "../../constants";
import { formatDate } from "../../utils";
import type { VideoMeta } from "../../interfaces";

interface VideoCardProps {
  video: VideoMeta;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <Link to={ROUTES.VIDEO_DETAIL(video.id)} className="video-card">
        <div className="video-card-thumb">
          {video.primaryThumbnailPath ? (
            <img
              src={videoService.mediaUrl(video.primaryThumbnailPath)}
              alt=""
              loading="lazy"
            />
          ) : (
            <div className="video-card-placeholder" aria-hidden>
              <span className="video-card-placeholder-icon" aria-hidden />
              <span>Preview unavailable</span>
            </div>
          )}
        </div>
        <div className="video-card-body">
          <h3 className="video-card-title">{video.title}</h3>
          <time className="video-card-date" dateTime={video.createdAt}>
            {formatDate(video.createdAt)}
          </time>
        </div>
      </Link>
    </motion.li>
  );
}
