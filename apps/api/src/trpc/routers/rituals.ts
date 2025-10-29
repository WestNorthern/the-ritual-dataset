// apps/api/src/trpc/routers/rituals.ts
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../../prisma.js";

const t = initTRPC.create();

/** Temporary, server-side metadata until DB columns exist */
type RitualMeta = {
  purpose?: string | null;
  history?: string | null;
  requirements?: string[]; // plain strings for easy rendering
};

const META_BY_SLUG: Record<string, RitualMeta> = {
  "bloody-mary": {
    purpose: "A mirror-based calling ritual exploring expectation and presence.",
    history:
      "Originating in 19–20th century folklore, the 'Bloody Mary' ritual involves chanting before a mirror in dim light to provoke a visual or felt presence.",
    requirements: ["Mirror", "Dim light or candle", "Quiet room", "Timer/phone"],
  },
  enochian: {
    purpose:
      "A guided calling inspired by historical Enochian work, focusing on attention, pacing, and silence.",
    history:
      "Enochian practice traces to John Dee and Edward Kelley in the late 16th century; this adaptation uses simplified call-and-response.",
    requirements: ["Quiet space", "Comfortable seat", "Headphones (recommended)"],
  },
};

export const ritualsRouter = t.router({
  getRunner: t.procedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      // Fetch only fields that exist in your current Prisma schema
      const r = await prisma.ritual.findUnique({
        where: { slug: input.slug },
        select: {
          id: true,
          slug: true,
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
      if (!r) return null;

      const meta = META_BY_SLUG[r.slug] ?? {};
      return {
        id: r.id,
        slug: r.slug,
        name: r.name,
        steps: r.steps,
        purpose: meta.purpose ?? null,
        history: meta.history ?? null,
        requirements: meta.requirements ?? [],
      };
    }),

  list: t.procedure.query(async () => {
    return prisma.ritual.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        _count: { select: { steps: true } },
      },
    });
  }),
});
