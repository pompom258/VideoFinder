import express from 'express';
import path from 'path';

import { VideoStorage } from '../../model/storages/videoStorage';
import { findVideoFilesRecurse } from '../../model/utils/fileUtil';
import { generateThumbnailFile } from '../../model/services/thumbnailService';
import { formatDuration, getVideoDuration } from '../../model/services/durationService';
import { VideosApiResponse } from '../../entities/apiResponse';

const router = express.Router();

/**
 * 動画情報の一覧を返却するAPI
 */
router.get("/videos", async (req, res) => {
    console.log(`[${new Date().toISOString()}] [Videos API Handler] ${req.method} '${req.url}' User-Agent: ${req.headers['user-agent']}`);
    try {
        const videoStorage = new VideoStorage();
        videoStorage.initialize();

        const videoFiles: string[] = findVideoFilesRecurse();

        const videoList: VideosApiResponse[] = await Promise.all(videoFiles
            .map(async (videoPath, index) => {
                const id: number = index + 1;

                const thumbnailName = `${id}.png`
                const thumbnailPath = await generateThumbnailFile(videoPath, thumbnailName);

                const videoDuration = await getVideoDuration(videoPath);

                videoStorage.add(id, videoPath, videoDuration);

                return {
                    videoName: path.basename(videoPath),
                    videoPath: videoPath,
                    thumbnailName: thumbnailName,
                    thumbnailPath: thumbnailPath,
                    videoDuration: formatDuration(videoDuration)
                }
            })
        );

        videoStorage.printAll();
        videoStorage.close();

        res.json(videoList);
    }
    catch (err) {
        const msg = `Error: ${err}`;

        console.error(msg, err);
        res.status(500).json({ error: msg });
    }
});

export default router;
