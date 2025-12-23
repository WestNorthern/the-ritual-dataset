// apps/api/src/trpc/routers/rituals.ts
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../../prisma.js";

const t = initTRPC.create();

/**
 * Extract first meaningful paragraph from markdown as a short description.
 * Skips header-only lines (## Title) and returns the first content paragraph.
 */
function extractDescription(md: string | null | undefined): string | null {
  if (!md) return null;

  const paragraphs = md.split(/\n\n+/);
  for (const p of paragraphs) {
    const trimmed = p.trim();
    // Skip if it's just a header (e.g., "## Purpose")
    if (/^#+\s*\S+$/.test(trimmed) && !trimmed.includes(" ", trimmed.indexOf(" ") + 1)) {
      continue;
    }
    // Remove leading header marker if present
    const content = trimmed.replace(/^#+\s*/, "").trim();
    if (content) return content;
  }
  return null;
}

export const ritualsRouter = t.router({
  /** Get a single ritual by slug (for ritual detail/preview) */
  getBySlug: t.procedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const ritual = await prisma.ritual.findUnique({
        where: { slug: input.slug },
        select: {
          id: true,
          slug: true,
          name: true,
          purposeMd: true,
          historyMd: true,
          requirements: true,
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

      return {
        id: ritual.id,
        slug: ritual.slug,
        name: ritual.name,
        purposeMd: ritual.purposeMd,
        historyMd: ritual.historyMd,
        requirements: ritual.requirements,
        steps: ritual.steps,
      };
    }),

  /** Get a single ritual by ID */
  getById: t.procedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      const ritual = await prisma.ritual.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          slug: true,
          name: true,
          purposeMd: true,
          historyMd: true,
          requirements: true,
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

  /** List all rituals (for ritual selection) */
  list: t.procedure.query(async () => {
    const rituals = await prisma.ritual.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        purposeMd: true,
        _count: { select: { steps: true } },
      },
    });

    return rituals.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      // Return first non-header paragraph as short description
      description: extractDescription(r.purposeMd),
      stepCount: r._count.steps,
    }));
  }),
});
