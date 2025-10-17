import { buildServer } from "./server.js";

const app = buildServer();
const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? "0.0.0.0";

app
  .listen({ port, host })
  .then(async () => {
    app.log.info(`BOOT: api listening on http://${host}:${port}`);
    await app.ready();
    app.log.info("\n" + app.printRoutes());
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
