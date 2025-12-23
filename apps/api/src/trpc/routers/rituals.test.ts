import { describe, it, expect, vi, beforeEach } from "vitest";
import { ritualsRouter } from "./rituals.js";

vi.mock("../../prisma.js", () => ({
  prisma: {
    ritual: { findUnique: vi.fn(), findMany: vi.fn() },
  },
}));

import { prisma } from "../../prisma.js";

beforeEach(() => vi.resetAllMocks());

const mockRitual = {
  id: "R1",
  slug: "bloody-mary",
  name: "Bloody Mary",
  purposeMd: "## Purpose\n\nA mirror ritual.",
  historyMd: "## History\n\nFolklore origins.",
  requirements: ["Mirror", "Candle"],
  steps: [
    {
      id: "s1",
      order: 0,
      kind: "PREPARATION",
      title: "Prep",
      videoUrl: "1.mp4",
      posterUrl: null,
      autoNext: true,
      record: false,
    },
    {
      id: "s2",
      order: 1,
      kind: "INVOCATION",
      title: "Invoke",
      videoUrl: "2.mp4",
      posterUrl: null,
      autoNext: true,
      record: false,
    },
    {
      id: "s3",
      order: 2,
      kind: "SILENCE",
      title: "Silence",
      videoUrl: "3.mp4",
      posterUrl: null,
      autoNext: false,
      record: true,
    },
    {
      id: "s4",
      order: 3,
      kind: "CLOSING",
      title: "Close",
      videoUrl: "4.mp4",
      posterUrl: null,
      autoNext: true,
      record: false,
    },
  ],
};

describe("rituals.getBySlug", () => {
  it("returns null if not found", async () => {
    (prisma.ritual.findUnique as any).mockResolvedValue(null);
    const res = await ritualsRouter.createCaller({} as any).getBySlug({ slug: "nope" });
    expect(res).toBeNull();
  });

  it("returns ritual with all fields from database", async () => {
    (prisma.ritual.findUnique as any).mockResolvedValue(mockRitual);

    const res = await ritualsRouter.createCaller({} as any).getBySlug({ slug: "bloody-mary" });

    expect(res).not.toBeNull();
    expect(res?.id).toBe("R1");
    expect(res?.slug).toBe("bloody-mary");
    expect(res?.name).toBe("Bloody Mary");
    expect(res?.purposeMd).toContain("mirror ritual");
    expect(res?.historyMd).toContain("Folklore");
    expect(res?.requirements).toEqual(["Mirror", "Candle"]);
    expect(res?.steps).toHaveLength(4);
  });

  it("orders steps ascending by order", async () => {
    (prisma.ritual.findUnique as any).mockResolvedValue(mockRitual);

    await ritualsRouter.createCaller({} as any).getBySlug({ slug: "bloody-mary" });

    expect(prisma.ritual.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "bloody-mary" },
        select: expect.objectContaining({
          steps: expect.objectContaining({ orderBy: { order: "asc" } }),
        }),
      }),
    );
  });
});

describe("rituals.getById", () => {
  const VALID_CUID = "clr1234567890123456789012";

  it("returns null if not found", async () => {
    (prisma.ritual.findUnique as any).mockResolvedValue(null);
    const res = await ritualsRouter.createCaller({} as any).getById({ id: VALID_CUID });
    expect(res).toBeNull();
  });

  it("returns ritual by id", async () => {
    (prisma.ritual.findUnique as any).mockResolvedValue(mockRitual);

    const res = await ritualsRouter.createCaller({} as any).getById({ id: VALID_CUID });

    expect(res?.slug).toBe("bloody-mary");
  });
});

describe("rituals.list", () => {
  it("returns empty array when no rituals", async () => {
    (prisma.ritual.findMany as any).mockResolvedValue([]);

    const res = await ritualsRouter.createCaller({} as any).list();

    expect(res).toEqual([]);
  });

  it("returns rituals with description extracted from purposeMd", async () => {
    (prisma.ritual.findMany as any).mockResolvedValue([
      {
        id: "clr1234567890123456789012",
        slug: "bloody-mary",
        name: "Bloody Mary",
        purposeMd: "## Purpose\n\nA mirror-based ritual exploring presence.",
        _count: { steps: 4 },
      },
      {
        id: "clr2234567890123456789012",
        slug: "enochian",
        name: "Enochian Calling",
        purposeMd: null,
        _count: { steps: 0 },
      },
    ]);

    const res = await ritualsRouter.createCaller({} as any).list();

    expect(res).toHaveLength(2);
    expect(res[0]).toEqual({
      id: "clr1234567890123456789012",
      slug: "bloody-mary",
      name: "Bloody Mary",
      description: "A mirror-based ritual exploring presence.",
      stepCount: 4,
    });
    expect(res[1]).toEqual({
      id: "clr2234567890123456789012",
      slug: "enochian",
      name: "Enochian Calling",
      description: null,
      stepCount: 0,
    });
  });

  it("skips header-only paragraphs and extracts content", async () => {
    (prisma.ritual.findMany as any).mockResolvedValue([
      {
        id: "clr1234567890123456789012",
        slug: "test",
        name: "Test",
        purposeMd: "## Purpose\n\nThis is the description.",
        _count: { steps: 2 },
      },
    ]);

    const res = await ritualsRouter.createCaller({} as any).list();

    // Should skip "## Purpose" and return the content paragraph
    expect(res[0].description).toBe("This is the description.");
  });

  it("handles markdown with inline content after header", async () => {
    (prisma.ritual.findMany as any).mockResolvedValue([
      {
        id: "clr1234567890123456789012",
        slug: "test",
        name: "Test",
        purposeMd: "A single paragraph without headers.",
        _count: { steps: 2 },
      },
    ]);

    const res = await ritualsRouter.createCaller({} as any).list();

    expect(res[0].description).toBe("A single paragraph without headers.");
  });
});
