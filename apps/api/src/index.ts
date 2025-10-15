import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: true });
await fastify.register(helmet);

fastify.get("/health", async () => ({ status: "ok" }));

// (tRPC will be wired in Step 4)

const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";

try {
  await fastify.listen({ port, host });
  fastify.log.info(`api listening on http://${host}:${port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}