import Fastify from "fastify";
import cors from "@fastify/cors";

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

app.get("/health", async () => ({ status: "ok" }));

const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";
await app.listen({ port, host });
