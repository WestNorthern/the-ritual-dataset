import { initTRPC } from "@trpc/server";
import type { Context } from "./context.js";
import { authRouter } from "./routers/auth.js";

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  auth: authRouter,
});

// Export type for the client (used later by web to type trpc)
export type AppRouter = typeof appRouter;
