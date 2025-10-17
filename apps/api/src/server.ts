import Fastify from "fastify";
import cookie from "@fastify/cookie";
import jwtPlugin from "@fastify/jwt";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";

import { appRouter } from "./trpc/root.js";
import { createContext } from "./trpc/context.js";

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "https://the-ritual-dataset-web.fly.dev";

export function buildServer() {
  const app = Fastify({
    logger: true,
    trustProxy: true, // Fly/any reverse proxy
  });

  // Security & rate limit (fine to register early)
  app.register(helmet, { contentSecurityPolicy: false });
  app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

  // --- CORS (must be before routes) ---
  app.register(cors, {
    // allow SSR/no-origin (health checks) and explicit web origin
    origin: (origin, cb) => {
      const allowList = new Set<string | undefined>([
        undefined, // curl/health checks, some server-to-server
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost:8080",
        "http://localhost:3001",
        WEB_ORIGIN, // e.g., https://the-ritual-dataset-web.fly.dev
      ]);
      cb(null, allowList.has(origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["content-type", "authorization", "x-trpc-source"],
    credentials: true, // you’re using cookies
    maxAge: 86400,
  });

  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");

  // Cookies & JWT-from-cookie
  app.register(cookie, { hook: "preHandler" });
  app.register(jwtPlugin, {
    secret: process.env.JWT_SECRET!,
    cookie: {
      cookieName: "trd_session",
      signed: false,
    },
  });

  // tRPC router
  app.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: { router: appRouter, createContext },
  });

  // Health
  app.get("/health", async () => ({ ok: true }));

  return app;
}
