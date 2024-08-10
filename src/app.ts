import express from 'express';
import dotenv from 'dotenv';

import { findVideoFilesRecurse } from "./utils/fileUtil";

dotenv.config();
const PORT = process.env.PORT;

const app = express();

app.get("/", (req, res) => {
    try {
        const videoFiles = findVideoFilesRecurse();

        const fileList = videoFiles
            .map(file => `<li>${file}</li>`)
            .join('');

        const html = `
            <html>
            <body>
                <h1>Video Files</h1>
                <ul>${fileList}</ul>
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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}.`);
});
