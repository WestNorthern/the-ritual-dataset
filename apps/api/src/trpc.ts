import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const appRouter = t.router({
  ping: t.procedure.query(() => ({ ok: true, ts: Date.now() })),
  echo: t.procedure
    .input(z.object({ msg: z.string() }))
    .mutation(({ input }) => ({ msg: input.msg })),
});

export type AppRouter = typeof appRouter;
