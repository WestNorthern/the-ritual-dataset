import Fastify from "fastify";
import cookie from "@fastify/cookie";
import jwtPlugin from "@fastify/jwt";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";

import { appRouter } from "./trpc/root.js";
import { createContext } from "./trpc/context.js";

export function buildServer() {
  const app = Fastify({ logger: true });

  app.register(helmet, { contentSecurityPolicy: false });
  app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  app.register(cors, {
    origin: ["http://localhost:5173", "http://localhost:4173", "http://localhost:8080"],
    credentials: true,
  });

  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
  app.register(cookie, { hook: "preHandler" });
  app.register(jwtPlugin, {
    secret: process.env.JWT_SECRET!,
    cookie: {
      cookieName: "trd_session",
      signed: false,
    },
  });

  app.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: { router: appRouter, createContext },
  });

  app.get("/health", async () => ({ ok: true }));

  return app;
}
