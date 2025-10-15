/* eslint-env node */
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "node:path";

const fastify = Fastify({ logger: true });

// health first
fastify.get("/health", async () => ({ status: "ok" }));

// serve built client
const clientDir = path.resolve("dist", "client");
await fastify.register(fastifyStatic, {
  root: clientDir,
  prefix: "/",
});

// SPA fallback *without* declaring GET /* again
fastify.setNotFoundHandler((req, reply) => {
  // only fall back for GET HTML requests
  const accept = String(req.headers.accept || "");
  if (req.method === "GET" && accept.includes("text/html")) {
    return reply.sendFile("index.html");
  }
  reply.code(404).send({ error: "Not Found" });
});

const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";
await fastify.listen({ port, host });
