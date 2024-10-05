import express from 'express';
import path from 'path';
import { exec } from 'child_process';

import { VideoStorage } from '../../model/storages/videoStorage';
import { findVideoFilesRecurse } from '../../model/utils/fileUtil';
import { generateThumbnailFile } from '../../model/services/thumbnailService';
import { formatDuration, getVideoDuration } from '../../model/services/durationService';
import { VideosApiResponse } from '../../entities/apiResponse';
import { PlayApiRequest } from '../../entities/apiRequest';

const router = express.Router();
const videoStorage = new VideoStorage();

/**
 * 動画情報の一覧を返却するAPI
 */
router.get("/videos", async (req, res) => {
    console.log(`[${new Date().toISOString()}] [Videos API Handler] ${req.method} '${req.url}' User-Agent: ${req.headers['user-agent']}`);
    try {
        videoStorage.initialize();

        const videoFiles: string[] = findVideoFilesRecurse();

        const videoList: VideosApiResponse[] = [];
        for (let i = 0; i < videoFiles.length; i++) {
            const videoPath = videoFiles[i];

            const id: number = i + 1;

            const thumbnailName = `${id}.png`

            let thumbnailPath: string | undefined = undefined;
            try {
                thumbnailPath = await generateThumbnailFile(videoPath, thumbnailName);
            } catch {
                console.warn(`Generation of the Thumbnail for the video '${videoPath}' failed, so generation is skipped.`);
            }

            let videoDuration: number | undefined = undefined;
            try {
                videoDuration = await getVideoDuration(videoPath);
            } catch {
                videoDuration = 0;
                console.warn(`Retrieving the duration of the video '${videoPath}' failed, so set the duration to 0.`);
            }

            videoStorage.add(id, videoPath, videoDuration);

            videoList.push({
                id: id,
                videoName: path.basename(videoPath),
                videoPath: videoPath,
                thumbnailName: thumbnailPath ? thumbnailName : "",
                thumbnailPath: thumbnailPath ?? "",
                videoDuration: formatDuration(videoDuration),
                isThumbnailGenerationSucceed: thumbnailPath !== undefined
            });
        }

        res.json(videoList);
    }
    catch (err) {
        console.log(`A fatal error occurred while executing Videos API: ${err}`);
        res.status(500).json({ error: err });
    }
});

/**
 * IDに対応する動画をローカルマシンの既定のアプリケーションで再生するAPI
 */
router.get("/play", async (req: PlayApiRequest, res) => {
    console.log(`[${new Date().toISOString()}] [Play API Handler] ${req.method} '${req.url}' User-Agent: ${req.headers['user-agent']}`);
    try {
        const { videoId } = req.query;
        const { path } = await videoStorage.get(parseInt(videoId!));

        const command: string = `start "" "${path}"`;
        exec(command, (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Failed to execute play video command." });
            } else {
                res.json({ message: "Video playback started." });
            }
        })
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

export default router;
