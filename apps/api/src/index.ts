import { buildServer } from "./server.js";

const PORT = Number(process.env.PORT ?? 3001); // <-- dev default 3001
const HOST = process.env.HOST ?? "0.0.0.0";

const app = buildServer();

app
  .listen({ port: PORT, host: HOST })
  .then(() => {
    app.log.info(`API listening on http://${HOST}:${PORT}`);
  })
  .catch((err) => {
    app.log.error(err, "Failed to start server");
    process.exit(1);
  });
