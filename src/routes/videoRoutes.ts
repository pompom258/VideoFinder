import express from 'express';
import axios from 'axios'
import path from 'path';

import { DEFAULT_THUMBNAIL_IMGNAME } from '../config/constants';
import { PORT } from '../config/env';
import { VideosApiResponse } from '../entities/apiResponse';

const router = express.Router();

router.get("/", async (req, res) => {
    console.log(`[${new Date().toISOString()}] [Videos View handler] ${req.method} '${req.url}' User-Agent: ${req.headers['user-agent']}`);
    try {
        const { data: videos }: { data: VideosApiResponse[] } = await axios.get(`http://localhost:${PORT}/api/videos`);

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
                            ${videos.map(video => {
                                const thumbnailSrc = video.isThumbnailGenerationSucceed
                                    ? `/thumbnails/${encodeURIComponent(video.thumbnailName)}`
                                    : `/default/${encodeURIComponent(DEFAULT_THUMBNAIL_IMGNAME)}`;

                                return `
                                <div class="video-item" id="video-${video.id}">
                                    <div class="thumbnail-container">
                                        <img src="${thumbnailSrc}" alt="${video.videoPath}" title="${video.videoName}" class="video-thumbnail" id="video-thumbnail-${video.id}">
                                        <span class="video-duration">${video.videoDuration}</span>
                                    </div>
                                    <div class="video-info">
                                        <p class="video-title" id="video-title-${video.id}">${video.videoName}</p>
                                        <p class="video-path">${path.dirname(video.videoPath)}</p>
                                    </div>
                                </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    <script src="js/events/searchEvent.js"></script>
                    <script src="js/events/playEvent.js"></script>
                </body>
            </html>
        `;

        res.send(html);
    } catch (err) {
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <title>Error</title>
            </head>
            <body>
                <pre>${err}</pre>
            </body>
            </html>
        `;

        res.status(200).send(html);
    }
});

export default router;
