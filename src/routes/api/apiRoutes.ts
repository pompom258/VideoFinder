import express from "express";
import path from "path";
import { exec } from "child_process";

import { VideoStorage } from "../../model/storages/videoStorage.js";
import { findVideoFilesRecurse } from "../../model/utils/fileUtil.js";
import {
  cleanupThumbnailFiles,
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
  VideosApiRequest,
  GetGifsApiRequest,
} from "../../entities/apiRequest.js";
import { ThumbnailStorage } from "../../model/storages/thumbnailStorage.js";
import { VideosApiResponse } from "../../entities/apiResponse.js";
import {
  VideosTableRecord,
  ThumbnailsTableRecord,
} from "../../entities/table.js";
import {
  fullPathToPublicPath,
  indexToStartTime,
} from "../../model/utils/convertUtil.js";
import { ANIMATION_THUMBNAIL_GENERATION_INTERVAL_SEC } from "../../config/constants.js";

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

    await cleanupThumbnailFiles();

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
router.get("/videos", async (req: VideosApiRequest, res) => {
  console.log(
    `[${new Date().toISOString()}] [Videos API Handler] ${req.method} '${req.url}' User-Agent: ${req.headers["user-agent"]}`
  );
  try {
    const { keyword } = req.query;

    const videos: VideosTableRecord[] = keyword
      ? (await videoStorage.getAll()).filter((video) =>
          video.path.toLowerCase().includes((keyword as string).toLowerCase())
        )
      : await videoStorage.getAll();
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
 * indexクエリで開始位置を指定可能（index=0→00:00:00, index=1→00:05:00, ...）
 */
router.get("/getGif", async (req: GetGifApiRequest, res) => {
  console.log(
    `[${new Date().toISOString()}] [GetGif API Handler] ${req.method} '${req.url}' User-Agent: ${req.headers["user-agent"]}`
  );
  try {
    const { videoId, index } = req.query;
    const { path } = await videoStorage.get(parseInt(videoId!));

    // ANIMATION_THUMBNAIL_GENERATION_INTERVAL_SECで定義された秒数ごとに開始位置をずらす
    const idx = index !== undefined ? parseInt(index as string) : 0;
    const generationInterval = ANIMATION_THUMBNAIL_GENERATION_INTERVAL_SEC / 60;
    const startTime = indexToStartTime(idx, generationInterval);
    const gifFileName = `${videoId}_${idx}.gif`;

    let thumbnailPath: string | undefined = undefined;
    try {
      thumbnailPath = await generateThumbnailGif(path, gifFileName, startTime);
      res.sendFile(thumbnailPath);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Failed to generate animation Thumbnail." });
    }
  } catch (err) {
    console.error(`A fatal error occurred while executing GetGif API: ${err}`);
    res.status(500).json({ error: err });
  }
});

/**
 * IDに対応する動画のGIFサムネイルを複数生成して返却するAPI
 * SSE(Server-Sent Events)で逐次返却
 * indexクエリで開始位置を指定可能（index=0→00:00:00, index=1→00:05:00, ...）
 * countクエリで生成するGIFの数を指定可能（デフォルト3、最大10）
 */
router.get("/getGifs", async (req: GetGifsApiRequest, res) => {
  console.log(
    `[${new Date().toISOString()}] [GetGifs API Handler] ${req.method} '${req.url}' User-Agent: ${req.headers["user-agent"]}`
  );

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { videoId, index, count } = req.query;
  const { path } = await videoStorage.get(parseInt(videoId!));

  const jobs = [];
  const startIdx = index !== undefined ? parseInt(index as string) : 0;
  const gifCount =
    count !== undefined ? Math.min(parseInt(count as string), 10) : 3;
  const generationInterval = ANIMATION_THUMBNAIL_GENERATION_INTERVAL_SEC / 60;

  for (let i = 0; i < gifCount; i++) {
    const idx = startIdx + i;
    const startTime = indexToStartTime(idx, generationInterval);
    const gifFileName = `${videoId}_${idx}.gif`;
    jobs.push({ name: gifFileName, start: startTime });
  }

  try {
    for (const job of jobs) {
      const outPath = await generateThumbnailGif(path, job.name, job.start);
      res.write(
        `data: ${JSON.stringify({ file: job.name, path: fullPathToPublicPath(outPath) })}\n\n`
      );
    }

    res.write(`event: end\ndata: done\n\n`);
    res.end();
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify(err)}\n\n`);
    res.end();
  }
});

export default router;
