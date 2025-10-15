import Fastify from "fastify";
import cors from "@fastify/cors";

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

app.get("/health", async () => ({ status: "ok" }));

app.get("/", () => ({
  service: "the-ritual-dataset-api",
  status: "ok",
  sha: process.env.GIT_SHA || process.env.GITHUB_SHA || "dev",
  now: new Date().toISOString(),
}));

const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";
await app.listen({ port, host });
