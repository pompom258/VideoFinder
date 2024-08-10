import express from 'express';
import dotenv from 'dotenv';

import router from './routes/videoRoutes'
import { generateThumbnailFile } from './services/thumbnailService';
import { THUMBNAIL_DIRECTORY } from './config/constants';

dotenv.config();
const PORT = process.env.PORT;

const app = express();

app.use("/", router);
app.use("/thumbnails", express.static(THUMBNAIL_DIRECTORY));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}.`);
});
