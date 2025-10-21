import { initTRPC } from "@trpc/server";
import type { Context } from "./context.js";
import { authRouter } from "./routers/auth.js";
import { ritualsRouter } from "./routers/rituals.js";
import { sessionsRouter } from "./routers/sessions.js";

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  auth: authRouter,
  rituals: ritualsRouter,
  sessions: sessionsRouter,
});

// Export type for the client (used later by web to type trpc)
export type AppRouter = typeof appRouter;
