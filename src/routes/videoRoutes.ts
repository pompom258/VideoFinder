import express from 'express';
import path from 'path';

import { findVideoFilesRecurse, isFileExists } from "../utils/fileUtil";
import { DEFAULT_THUMBNAIL_IMGNAME } from '../config/constants';
import { generateThumbnailFile } from '../services/thumbnailService';
import { getVideoDuration } from '../services/durationService';

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const videoFiles = findVideoFilesRecurse();

        const videoList = await Promise.all(videoFiles
            .map(videoPath => {
                return {
                    videoPath: videoPath,
                    thumbnailName: `thumbnail-${path.parse(videoPath).name.replace(/ /g, "_")}.png`
                }
            })
            .map(async video => {
                return {
                    videoName: path.basename(video.videoPath),
                    videoPath: video.videoPath,
                    thumbnailName: video.thumbnailName,
                    thumbnailPath: await generateThumbnailFile(video.videoPath, video.thumbnailName),
                    videoDuration: await getVideoDuration(video.videoPath)
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
                        <div class="video-gallery">
                            ${videoList.map(video => {
                                const thumbnailSrc = isFileExists(video.thumbnailPath)
                                    ? `/thumbnails/${encodeURIComponent(video.thumbnailName)}`
                                    : `/default/${encodeURIComponent(DEFAULT_THUMBNAIL_IMGNAME)}`;

                                return `
                                <div class="video-item">
                                    <div class="thumbnail-container">
                                        <img src="${thumbnailSrc}" alt="${video.videoPath}" title="${video.videoName}" class="video-thumbnail">
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
                </body>
            </html>
        `;

        res.send(html);
    } catch (err) {
        const msg = `Error: ${err}`;

        console.error(msg, err);
        res.status(500).send(msg);
    }
});

export default router;
