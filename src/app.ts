import express from 'express';
import dotenv from 'dotenv';

import router from './routes/videoRoutes'

dotenv.config();
const PORT = process.env.PORT;

const app = express();

app.use(express.static("public"));

app.use("/", router);
app.use("/js", express.static("dist"));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}.`);
});
