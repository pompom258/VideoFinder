import express from 'express';
import path from 'path';

import { findVideoFilesRecurse, isFileExists } from "../utils/fileUtil";
import { generateThumbnailFile } from '../services/thumbnailService';
import { DEFAULT_THUMBNAIL_IMGNAME } from '../config/constants';

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
                    videoPath: video.videoPath,
                    thumbnailName: video.thumbnailName,
                    thumbnailPath: await generateThumbnailFile(video.videoPath, video.thumbnailName)
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
                <h1>Video Gallery</h1>
                <div class="video-container">
                    ${videoList.map(video => {
                        const thumbnailSrc = isFileExists(video.thumbnailPath)
                            ? `/thumbnails/${encodeURIComponent(video.thumbnailName)}`
                            : `/default/${encodeURIComponent(DEFAULT_THUMBNAIL_IMGNAME)}`;

                        return `
                        <div class="video-item">
                            <div class="thumbnail-container">
                                <img src="${thumbnailSrc}" alt="${video.videoPath}" class="video-thumbnail">
                            </div>
                            <div class="video-info">
                                <a href="file:///${video.videoPath.replace(/\\/g, "/")}" class="video-title">${path.basename(video.videoPath)}</a>
                                <p class="video-path">${path.dirname(video.videoPath)}</p>
                            </div>
                        </div>
                        `;
                    }).join('')}

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
