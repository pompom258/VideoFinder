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
                let thumbnailPath: string = "";
                try {
                    console.log(`サムネイル作成開始: ${video.videoPath}`);
                    thumbnailPath = await generateThumbnailFile(video.videoPath, video.thumbnailName);
                    console.log(`サムネイル作成完了: ${thumbnailPath}`);
                } catch (error) {
                    console.error("サムネイル作成失敗", error);
                }

                return {
                    videoPath: video.videoPath,
                    thumbnailName: video.thumbnailName,
                    thumbnailPath: thumbnailPath
                }
            })
        );

        const html = `
            <html>
                <body>
                <h1>Video Files</h1>
                <div style="display: flex; flex-wrap: wrap;">
                    ${(videoList
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
                        })
                    ).join()};
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
