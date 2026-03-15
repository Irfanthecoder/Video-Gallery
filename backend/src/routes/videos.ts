import { Router } from "express";
import * as videoController from "../controllers/index.js";
import { uploadVideo } from "../middlewares/index.js";
import {
  ROUTE_VIDEOS_LIST,
  ROUTE_TAGS,
  ROUTE_VIDEO_BY_ID,
  ROUTE_THUMBNAILS_GENERATE,
  ROUTE_THUMBNAILS_SELECT,
} from "../constants/index.js";

const router = Router();

router.post(ROUTE_VIDEOS_LIST, uploadVideo.single("video"), videoController.uploadVideo);
router.get(ROUTE_VIDEOS_LIST, videoController.listVideos);
router.get(ROUTE_TAGS, videoController.getTags);
router.get(ROUTE_VIDEO_BY_ID, videoController.getVideo);
router.post(ROUTE_THUMBNAILS_GENERATE, videoController.generateThumbnails);
router.post(ROUTE_THUMBNAILS_SELECT, videoController.selectThumbnail);

export default router;
