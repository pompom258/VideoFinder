import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, "../../");
const CONFIG_FILE_PATH = path.join(PROJECT_ROOT, "search_directories.json");

function getSearchDirectories(): string[] {
  const defaultDir = path.join(PROJECT_ROOT, "sample");
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, "utf-8"));
      if (Array.isArray(config.directories)) {
        return config.directories.map((dir: string) =>
          path.isAbsolute(dir) ? dir : path.join(PROJECT_ROOT, dir)
        );
      }
    } catch (error) {
      console.error("Error reading search_directories.json:", error);
    }
  }
  return [defaultDir];
}

export const VIDEO_DIRECTORIES = getSearchDirectories();
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
  "../../public/thumbnails"
);
export const THUMBNAIL_SIZE = "768x432";
export const DEFAULT_THUMBNAIL_IMGNAME = "thumbnail_default.png";

export const TABLE_NAME_VIDEOS = "videos";
export const TABLE_PATH_VIDEOS = "./videos.db";

export const TABLE_NAME_THUMBNAILS = "thumbnails";
export const TABLE_PATH_THUMBNAILS = "./thumbnails.db";
