import { describe, it, expect, vi, beforeEach } from "vitest";
import { ritualsRouter } from "./rituals.js";

vi.mock("../../prisma.js", () => ({
  prisma: {
    ritual: { findUnique: vi.fn() },
  },
}));

import { prisma } from "../../prisma.js";

beforeEach(() => vi.resetAllMocks());

describe("rituals.getRunner", () => {
  it("returns null if not found", async () => {
    (prisma.ritual.findUnique as any).mockResolvedValue(null);
    const res = await ritualsRouter.createCaller({} as any).getRunner({ slug: "nope" });
    expect(res).toBeNull();
  });

  it("orders steps asc", async () => {
    // Return already-sorted steps so our value assertion is deterministic
    (prisma.ritual.findUnique as any).mockResolvedValue({
      id: "R1",
      slug: "bloody-mary",
      name: "Bloody Mary",
      steps: [
        {
          id: "s1",
          order: 1,
          kind: "PREPARATION",
          title: "Prep",
          videoUrl: "1.mp4",
          posterUrl: null,
          autoNext: true,
          record: false,
        },
        {
          id: "s2",
          order: 2,
          kind: "INVOCATION",
          title: "Invo",
          videoUrl: "2.mp4",
          posterUrl: null,
          autoNext: true,
          record: false,
        },
      ],
    });

    const res = await ritualsRouter.createCaller({} as any).getRunner({ slug: "bloody-mary" });

    // 1) Assert the router asked for ascending order
    expect(prisma.ritual.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "bloody-mary" },
        select: expect.objectContaining({
          steps: expect.objectContaining({ orderBy: { order: "asc" } }),
        }),
      }),
    );

    // 2) And the returned data is ascending (given our mock)
    expect(res?.steps[0].order).toBeLessThan(res!.steps[1].order);
  });
});
