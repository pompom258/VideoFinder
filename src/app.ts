import express from 'express';
import dotenv from 'dotenv';

import router from './routes/videoRoutes'
import { DEFAULT_DIRECTORY, THUMBNAIL_DIRECTORY } from './config/constants';

dotenv.config();
const PORT = process.env.PORT;

const app = express();

app.use(express.static("public"));

app.use("/", router);
app.use("/thumbnails", express.static(THUMBNAIL_DIRECTORY));
app.use("/default", express.static(DEFAULT_DIRECTORY));
app.use("/js", express.static("dist"));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}.`);
});
