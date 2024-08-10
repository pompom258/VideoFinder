import express from 'express';
import path from 'path';

import { findVideoFilesRecurse } from "../utils/fileUtil";
import { generateThumbnailFile } from '../services/thumbnailService';

const router = express.Router();

router.get("/", (req, res) => {
    try {
        const videoFiles = findVideoFilesRecurse();

        const videoList = videoFiles
            .map(videoPath => {
                return {
                    videoPath: videoPath,
                    thumbnailName: `thumbnail-${path.parse(videoPath).name.replace(/ /g, "_")}.png`
                }
            })
            .map(video => {
                console.log(`サムネイル作成開始\n対象ファイル: ${video.videoPath}\n出力サムネイルファイル名: ${video.thumbnailName}`);
                generateThumbnailFile(video.videoPath, video.thumbnailName);
                return video;
            })
            .map(video => `
                <div style="display: inline-block; margin: 10px; text-align: center;">
                    <img src="/thumbnails/${encodeURIComponent(video.thumbnailName)}" alt="${video.videoPath}" style="width: 320px; height: 240px; object-fit: contain;">
                    <p>${video.videoPath}</p>
                </div>
            `);

        const html = `
            <html>
                <body>
                <h1>Video Files</h1>
                <div style="display: flex; flex-wrap: wrap;">
                    ${videoList.join('')}
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
