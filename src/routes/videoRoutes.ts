import express from 'express';
import path from 'path';

import { findVideoFilesRecurse, isFileExists } from "../utils/fileUtil";
import { generateThumbnailFile } from '../services/thumbnailService';
import { DEFAULT_THUMBNAIL_IMGNAME } from '../config/constants';

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
                return {
                    videoPath: video.videoPath,
                    thumbnailName: video.thumbnailName,
                    thumbnailPath: generateThumbnailFile(video.videoPath, video.thumbnailName)
                }
            })
            .map(video => {
                const thumbnailSrc: string = (() => {
                    if (isFileExists(video.thumbnailPath)) {
                        return `/thumbnails/${encodeURIComponent(video.thumbnailName)}`;
                    } else {
                        return `/default/${encodeURIComponent(DEFAULT_THUMBNAIL_IMGNAME)}`;
                    }
                })();

                return `
                <div style="display: inline-block; margin: 10px; text-align: center;" class="video">
                    <img src="${thumbnailSrc}" alt="${video.videoPath}" style="width: 320px; height: 240px; object-fit: contain;">
                    <a href="file:///${video.videoPath.replace(/\\/g, "/")}">${video.videoPath}</a>
                </div>
                `
            });

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
