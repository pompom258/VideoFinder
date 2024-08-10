import express from 'express';
import { findVideoFilesRecurse } from "../utils/fileUtil";
import { generateThumbnailFile } from '../services/thumbnailService';

const router = express.Router();

router.get("/", (req, res) => {
    try {
        const videoFiles = findVideoFilesRecurse();

        const videoList = videoFiles.map((file) => `
        <div style="display: inline-block; margin: 10px; text-align: center;">
            <img src="/thumbnails/${encodeURIComponent(file)}.jpg" alt="${file}" style="width: 320px; height: 240px; object-fit: contain;">
            <p>${file}</p>
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
