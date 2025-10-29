import type { Prisma, PrismaClient } from "@prisma/client";
import { PrismaClient, RitualStepKind } from "@prisma/client";

/**
 * Idempotent ritual seed. If `prismaArg` is not provided, this
 * function will create and dispose its own PrismaClient.
 */
export async function seedRituals(prismaArg?: PrismaClient) {
  const prisma = prismaArg ?? new PrismaClient();
  const shouldDisconnect = !prismaArg;

  try {
    await prisma.$transaction(async (tx) => {
      // 1) Bloody Mary
      const bm = await tx.ritual.upsert({
        where: { slug: "bloody-mary" },
        update: {
            name: "Bloody Mary",
            purpose: "A classic mirror-based calling ritual exploring expectation and presence.",
            history: "Originating in 19th–20th century folklore... (longer copy here).",
            requirements: ["Mirror", "Dim light or candle", "Quiet room", "Timer/phone"],
        },
        create: {
            slug: "bloody-mary",
            name: "Bloody Mary",
            purpose: "A classic mirror-based calling ritual exploring expectation and presence.",
            history: "Originating in 19th–20th century folklore... (longer copy here).",
            requirements: ["Mirror", "Dim light or candle", "Quiet room", "Timer/phone"],
        },
        select: { id: true },
      });

      await upsertStep(tx, bm.id, 1, {
        kind: RitualStepKind.PREPARATION,
        title: "Preparation",
        videoUrl: "/videos/bm/1-prep.mp4",
        posterUrl: "/videos/bm/1-prep.jpg",
        autoNext: true,
        record: false,
      });

      await upsertStep(tx, bm.id, 2, {
        kind: RitualStepKind.INVOCATION,
        title: "Invocation",
        videoUrl: "/videos/bm/2-invocation.mp4",
        posterUrl: "/videos/bm/2-invocation.jpg",
        autoNext: true,
        record: false,
      });

      await upsertStep(tx, bm.id, 3, {
        kind: RitualStepKind.SILENCE,
        title: "Silence",
        videoUrl: "/videos/bm/3-silence.mp4",
        posterUrl: "/videos/bm/3-silence.jpg",
        autoNext: true,
        record: true,
      });

      await upsertStep(tx, bm.id, 4, {
        kind: RitualStepKind.CLOSING,
        title: "Closing",
        videoUrl: "/videos/bm/4-closing.mp4",
        posterUrl: "/videos/bm/4-closing.jpg",
        autoNext: true,
        record: false,
      });

      // 2) Enochian (add more steps as you render videos)
      const en = await tx.ritual.upsert({
        where: { slug: "enochian" },
        update: { name: "Enochian Calling" },
        create: { slug: "enochian", name: "Enochian Calling" },
        select: { id: true },
      });

      await upsertStep(tx, en.id, 1, {
        kind: RitualStepKind.PREPARATION,
        title: "Preparation",
        videoUrl: "/videos/en/1-prep.mp4",
        posterUrl: "/videos/en/1-prep.jpg",
        autoNext: true,
        record: false,
      });
    });
  } finally {
    if (shouldDisconnect) await prisma.$disconnect();
  }
}

type StepInput = {
  kind: RitualStepKind;
  title?: string | null;
  videoUrl: string;
  posterUrl?: string | null;
  autoNext?: boolean;
  record?: boolean;
};

async function upsertStep(
  tx: Prisma.TransactionClient,
  ritualId: string,
  order: number,
  s: StepInput
) {
  await tx.ritualStep.upsert({
    where: { ritualId_order: { ritualId, order } }, // requires @@unique([ritualId, order])
    update: {
      kind: s.kind,
      title: s.title ?? null,
      videoUrl: s.videoUrl,
      posterUrl: s.posterUrl ?? null,
      autoNext: s.autoNext ?? true,
      record: s.record ?? false,
    },
    create: {
      ritualId,
      order,
      kind: s.kind,
      title: s.title ?? null,
      videoUrl: s.videoUrl,
      posterUrl: s.posterUrl ?? null,
      autoNext: s.autoNext ?? true,
      record: s.record ?? false,
    },
  });
}
