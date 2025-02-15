import express from "express";

import videoRouter from "./routes/videoRoutes";
import videoServer from "./routes/api/apiRoutes";
import { PORT } from "./config/env";

const app = express();

app.use(express.json());

app.use(express.static("public"));
app.use("/api", videoServer);

app.use("/", videoRouter);
app.use("/js", express.static("dist"));

app.use((req, res) => {
  console.log(
    `[${new Date().toISOString()}] [404 Handler] ${req.method} '${req.url}' User-Agent: ${req.headers["user-agent"]}`,
  );
  const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8" />
            <title>Error</title>
        </head>
        <body>
            <pre>Not found</pre>
        </body>
        </html>
    `;

  res.status(404).send(html);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}.`);
});
