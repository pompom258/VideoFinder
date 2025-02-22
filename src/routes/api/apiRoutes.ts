import express from "express";
import path from "path";
import { exec } from "child_process";

import { VideoStorage } from "../../model/storages/videoStorage.js";
import { findVideoFilesRecurse } from "../../model/utils/fileUtil.js";
import {
  generateThumbnailFile,
  generateThumbnailGif,
} from "../../model/services/thumbnailService.js";
import {
  formatDuration,
  getVideoDuration,
} from "../../model/services/durationService.js";
import {
  ScanApiRequest,
  PlayApiRequest,
  GetGifApiRequest,
} from "../../entities/apiRequest.js";
import { ThumbnailStorage } from "../../model/storages/thumbnailStorage.js";
import { VideosApiResponse } from "../../entities/apiResponse.js";
import {
  VideosTableRecord,
  ThumbnailsTableRecord,
} from "../../entities/table.js";

const router = express.Router();
const videoStorage = new VideoStorage();
const thumbnailStorage = new ThumbnailStorage();

/**
 * ローカルマシンの動画ファイルをスキャンしてDBに格納するAPI
 */
router.post("/scan", async (req: ScanApiRequest, res) => {
  console.log(
    `[${new Date().toISOString()}] [Scan API Handler] ${req.method} '${req.url}' User-Agent: ${req.headers["user-agent"]}`
  );
  try {
    const { dirPath } = req.body;

    videoStorage.initialize();
    thumbnailStorage.initialize();

    const videoFiles: string[] = dirPath
      ? findVideoFilesRecurse(dirPath)
      : findVideoFilesRecurse();

    for (let i = 0; i < videoFiles.length; i++) {
      const videoPath: string = videoFiles[i];
      const id: number = i + 1;
      const thumbnailName: string = `${id}.png`;

      let thumbnailPath: string | undefined = undefined;
      try {
        thumbnailPath = await generateThumbnailFile(videoPath, thumbnailName);
      } catch {
        console.warn(
          `Generation of the Thumbnail for the video '${videoPath}' failed, so generation is skipped.`
        );
      }

      let videoDuration: number | undefined = undefined;
      try {
        videoDuration = await getVideoDuration(videoPath);
      } catch {
        videoDuration = 0;
        console.warn(
          `Retrieving the duration of the video '${videoPath}' failed, so set the duration to 0.`
        );
      }

      videoStorage.add(id, videoPath, videoDuration);
      if (thumbnailPath) {
        thumbnailStorage.add(id, thumbnailPath);
      }
    }

    res.json({ message: "All videos has been scanned." });
  } catch (err) {
    console.error(`A fatal error occurred while executing Scan API: ${err}`);
    res.status(500).json({ error: err });
  }
});

/**
 * DBから動画情報の一覧を返却するAPI
 */
router.get("/videos", async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] [Videos API Handler] ${req.method} '${req.url}' User-Agent: ${req.headers["user-agent"]}`
  );
  try {
    const videos: VideosTableRecord[] = await videoStorage.getAll();
    const thumbnails: ThumbnailsTableRecord[] = await thumbnailStorage.getAll();

    res.json(
      videos.map((video: VideosTableRecord): VideosApiResponse => {
        const thumbnail: ThumbnailsTableRecord | undefined = thumbnails.find(
          (thumbnail) => thumbnail.id === video.id
        );
        return {
          id: video.id,
          videoName: path.basename(video.path),
          videoPath: video.path,
          thumbnailName: thumbnail ? path.basename(thumbnail.path) : "",
          thumbnailPath: thumbnail?.path ?? "",
          videoDuration: formatDuration(video.durationSeconds),
          isThumbnailGenerationSucceed: thumbnail !== undefined,
        };
      })
    );
  } catch (err) {
    console.error(`A fatal error occurred while executing Videos API: ${err}`);
    res.status(500).json({ error: err });
  }
});

/**
 * キーワードに基づいて動画を検索するAPI
 */
router.get("/search", async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] [Search API Handler] ${req.method} '${req.url}' User-Agent: ${req.headers["user-agent"]}`
  );
  try {
    const { keyword } = req.query;
    const videos: VideosTableRecord[] = await videoStorage.search(
      keyword as string
    );
    const thumbnails: ThumbnailsTableRecord[] = await thumbnailStorage.getAll();

    res.json(
      videos.map((video: VideosTableRecord): VideosApiResponse => {
        const thumbnail: ThumbnailsTableRecord | undefined = thumbnails.find(
          (thumbnail) => thumbnail.id === video.id
        );
        return {
          id: video.id,
          videoName: path.basename(video.path),
          videoPath: video.path,
          thumbnailName: thumbnail ? path.basename(thumbnail.path) : "",
          thumbnailPath: thumbnail?.path ?? "",
          videoDuration: formatDuration(video.durationSeconds),
          isThumbnailGenerationSucceed: thumbnail !== undefined,
        };
      })
    );
  } catch (err) {
    console.error(`A fatal error occurred while executing Search API: ${err}`);
    res.status(500).json({ error: err });
  }
});

/**
 * IDに対応する動画をローカルマシンの既定のアプリケーションで再生するAPI
 */
router.get("/play", async (req: PlayApiRequest, res) => {
  console.log(
    `[${new Date().toISOString()}] [Play API Handler] ${req.method} '${req.url}' User-Agent: ${req.headers["user-agent"]}`
  );
  try {
    const { videoId } = req.query;
    const { path } = await videoStorage.get(parseInt(videoId!));

    const command: string = `start "" "${path}"`;
    exec(command, (err) => {
      if (err) {
        console.error(err);
        res
          .status(500)
          .json({ error: "Failed to execute play video command." });
      } else {
        res.json({ message: "Video playback started." });
      }
    });
  } catch (err) {
    console.error(`A fatal error occurred while executing Play API: ${err}`);
    res.status(500).json({ error: err });
  }
});

/**
 * IDに対応する動画のGIFサムネイルを生成して返却するAPI
 */
router.get("/getGif", async (req: GetGifApiRequest, res) => {
  console.log(
    `[${new Date().toISOString()}] [GetGif API Handler] ${req.method} '${req.url}' User-Agent: ${req.headers["user-agent"]}`
  );
  try {
    const { videoId } = req.query;
    const { path } = await videoStorage.get(parseInt(videoId!));

    let thumbnailPath: string | undefined = undefined;
    try {
      thumbnailPath = await generateThumbnailGif(path, `${videoId}.gif`);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Failed to generate animation Thumbnail." });
    }

    res.sendFile(thumbnailPath!);
  } catch (err) {
    console.error(`A fatal error occurred while executing GetGif API: ${err}`);
    res.status(500).json({ error: err });
  }
});

export default router;
