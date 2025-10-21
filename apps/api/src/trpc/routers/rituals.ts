import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../../prisma.js";

const t = initTRPC.create();
export const ritualsRouter = t.router({
  getRunner: t.procedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const ritual = await prisma.ritual.findUnique({
      where: { slug: input.slug },
      select: {
        id: true,
        name: true,
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
    });
    if (!ritual) return null;
    return ritual;
  }),
  list: t.procedure.query(async () => {
    return prisma.ritual.findMany({
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true, _count: { select: { steps: true } } },
    });
  }),
});
