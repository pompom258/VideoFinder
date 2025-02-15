import path from "path";

export const VIDEO_DIRECTORY = path.join(__dirname, "../../sample");
export const VIDEO_EXTENSIONS = [
  ".mp4",
  ".mkv",
  ".mov",
  ".avi",
  ".wmv",
  ".flv",
];

export const THUMBNAIL_DIRECTORY = path.join(
  __dirname,
  "../../public/thumbnails",
);
export const THUMBNAIL_SIZE = "768x432";
export const DEFAULT_THUMBNAIL_IMGNAME = "thumbnail_default.png";

export const TABLE_NAME_VIDEOS = "videos";
export const TABLE_PATH_VIDEOS = "./videos.db";

export const TABLE_NAME_THUMBNAILS = "thumbnails";
export const TABLE_PATH_THUMBNAILS = "./thumbnails.db";
