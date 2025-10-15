import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "node:path";

const fastify = Fastify({ logger: true });

// Health
fastify.get("/health", async () => ({ status: "ok" }));

// Serve built client (we'll copy it to /app/dist/client)
const clientDir = path.resolve("dist", "client");
await fastify.register(fastifyStatic, { root: clientDir, prefix: "/" });

// SPA fallback
fastify.get("/*", (_req, reply) => reply.sendFile("index.html"));

const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";
try {
  await fastify.listen({ port, host });
  fastify.log.info(`web listening on http://${host}:${port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
