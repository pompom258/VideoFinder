import express from 'express';
import path from 'path';

import { findVideoFilesRecurse, isFileExists } from "../utils/fileUtil";
import { DEFAULT_THUMBNAIL_IMGNAME } from '../config/constants';
import { generateThumbnailFile } from '../services/thumbnailService';
import { formatDuration, getVideoDuration } from '../services/durationService';
import { VideoStorage } from '../videoStorage';

const router = express.Router();

router.get("/", async (req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} '${req.url}' User-Agent: ${req.headers['user-agent']}`);
    try {
        const videoStorage = new VideoStorage();
        videoStorage.initialize();

        const videoFiles: string[] = findVideoFilesRecurse();

        const videoList = await Promise.all(videoFiles
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

        const html = `
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Video Gallery</title>
                    <link rel="stylesheet" href="/styles.css">
                </head>
                <body>
                    <div class="container">
                        <h1>Video Gallery</h1>
                        <div class="search-container">
                            <input type="text" id="search-input" placeholder="Search videos...">
                            <button id="search-button">Search</button>
                        </div>
                        <div class="video-gallery">
                            ${videoList.map(video => {
                                const thumbnailSrc = isFileExists(video.thumbnailPath)
                                    ? `/thumbnails/${encodeURIComponent(video.thumbnailName)}`
                                    : `/default/${encodeURIComponent(DEFAULT_THUMBNAIL_IMGNAME)}`;

                                return `
                                <div class="video-item">
                                    <div class="thumbnail-container">
                                        <a href="${video.videoPath}">
                                            <img src="${thumbnailSrc}" alt="${video.videoPath}" title="${video.videoName}" class="video-thumbnail">
                                        </a>
                                        <span class="video-duration">${video.videoDuration}</span>
                                    </div>
                                    <div class="video-info">
                                        <a href="file:///${video.videoPath.replace(/\\/g, "/")}" class="video-title">${video.videoName}</a>
                                        <p class="video-path">${path.dirname(video.videoPath)}</p>
                                    </div>
                                </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    <script src="js/events/searchEvent.js"></script>
                </body>
            </html>
        `;

        videoStorage.printAll();
        res.send(html);
    } catch (err) {
        const msg = `Error: ${err}`;

        console.error(msg, err);
        res.status(500).send(msg);
    }
});

export default router;
