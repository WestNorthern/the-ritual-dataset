import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Context } from "../../trpc/context.js";
import { prisma } from "../../prisma.js";

const t = initTRPC.context<Context>().create();

// helper: get wid from JWT
async function readWid(ctx: Context): Promise<string | null> {
  const req: any = ctx.req;
  if (typeof req?.jwtVerify !== "function") return null;
  try {
    const payload = (await req.jwtVerify()) as { wid?: string };
    return payload?.wid ?? null;
  } catch {
    return null;
  }
}

export const sessionsRouter = t.router({
  start: t.procedure
    .input(z.object({ ritualId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const wid = await readWid(ctx);
      if (!wid) throw new TRPCError({ code: "UNAUTHORIZED" });

      // sanity: ritual must exist
      const ritual = await prisma.ritual.findUnique({
        where: { id: input.ritualId },
        select: { id: true },
      });
      if (!ritual) throw new TRPCError({ code: "NOT_FOUND", message: "Ritual not found" });

      const s = await prisma.session.create({
        data: { ritualId: ritual.id, witnessId: wid, status: "RUNNING" },
        select: { id: true },
      });
      return s; // { id }
    }),

  getRunner: t.procedure
  .input(z.object({ sessionId: z.string().cuid() }))
  .query(async ({ input, ctx }) => {
    const wid = await readWid(ctx);
    if (!wid) throw new TRPCError({ code: "UNAUTHORIZED" });

    const s = await prisma.session.findUnique({
      where: { id: input.sessionId },
      select: {
        id: true,
        witnessId: true,
        ritual: {
          select: {
            id: true,
            slug: true,
            name: true,
            // 🚫 remove these if your Prisma model doesn't have them yet:
            // purpose: true,
            // history: true,
            // requirements: true,
            steps: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                kind: true,
                order: true,
                title: true,
                videoUrl: true,
                posterUrl: true,
                autoNext: true,
                record: true,
              },
            },
          },
        },
      },
    });

    if (!s) throw new TRPCError({ code: "NOT_FOUND", message: "Session not found." });
    if (s.witnessId && s.witnessId !== wid) throw new TRPCError({ code: "FORBIDDEN" });

    return { sessionId: s.id, ritual: s.ritual };
  }),
});
