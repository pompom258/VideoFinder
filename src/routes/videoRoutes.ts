import express from 'express';
import axios from 'axios'
import path from 'path';

import { DEFAULT_THUMBNAIL_IMGNAME } from '../config/constants';
import { PORT } from '../config/env';
import { isFileExists } from '../model/utils/fileUtil';
import { VideosApiResponse } from '../entities/apiResponse';

const router = express.Router();

router.get("/", async (req, res) => {
    console.log(`[${new Date().toISOString()}] [Videos View handler] ${req.method} '${req.url}' User-Agent: ${req.headers['user-agent']}`);
    try {
        const response = await axios.get(`http://localhost:${PORT}/api/videos`);
        if (response.status !== 200) {
            console.error(response.data.error);
            res.status(500).send(response.data.error);
        }

        const videos: VideosApiResponse[] = response.data;

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
                                const thumbnailSrc = isFileExists(video.thumbnailPath)
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
        const msg = `Error: ${err}`;

        console.error(msg, err);
        res.status(500).send(msg);
    }
});

export default router;
