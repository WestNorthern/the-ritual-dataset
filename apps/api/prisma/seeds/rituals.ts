// prisma/seedRituals.ts
import type { Prisma, PrismaClient } from "@prisma/client";
import { PrismaClient, RitualStepKind } from "@prisma/client";

/**
 * Idempotent ritual seed.  If `prismaArg` is not provided,
 * this function will create and dispose its own PrismaClient.
 */
export async function seedRituals(prismaArg?: PrismaClient) {
  const prisma = prismaArg ?? new PrismaClient();
  const shouldDisconnect = !prismaArg;

  try {
    await prisma.$transaction(async (tx) => {
      // 1) Bloody Mary ----------------------------------------------------------
      const bm = await tx.ritual.upsert({
        where: { slug: "bloody-mary" },
        update: {
          name: "Bloody Mary",
          purposeMd: `## Purpose

A **mirror-based experiment in presence and suggestion**.  
This ritual invites the Witness to confront their own reflection under
controlled conditions of dim light and heightened expectation.

> “When you look long into the mirror, the mirror also looks into you.”`,

          historyMd: `## History

The *Bloody Mary* legend circulates through 19ᵗʰ–20ᵗʰ-century sleep-over
folklore, often as a dare performed in dark bathrooms.  
Scholars trace it to older European scrying practices—using reflective
surfaces to glimpse future lovers or spirits.

**Modern psychology** frames it as a mild form of pareidolia:
after ~30 seconds, the brain begins to reinterpret its own reflection.

**Folkloric evolution**

- Victorian “Mirror Test” → Romantic divination games  
- 1960s American teens → “Say her name three times”  
- Internet era → viral endurance challenge

> The experiment endures because it perfectly mixes *science*, *myth*, and
the *human need to be startled by ourselves*.`,

          requirements: [
            "Mirror large enough to see your face",
            "Dim light or candle",
            "Quiet room with door that closes",
            "Timer or phone (30 seconds)",
          ],
        },
        create: {
          slug: "bloody-mary",
          name: "Bloody Mary",
          purposeMd: `## Purpose

A **mirror-based experiment in presence and suggestion**.  
This ritual invites the Witness to confront their own reflection under
controlled conditions of dim light and heightened expectation.`,
          historyMd: `## History

See folklore summary above.`,
          requirements: [
            "Mirror large enough to see your face",
            "Dim light or candle",
            "Quiet room with door that closes",
            "Timer or phone (30 seconds)",
          ],
        },
        select: { id: true },
      });

      // Steps are 0-indexed to match domain model
      await upsertStep(tx, bm.id, 0, {
        kind: RitualStepKind.PREPARATION,
        title: "Preparation",
        videoUrl: "/videos/bm/1-prep.mp4",
        posterUrl: "/videos/bm/1-prep.jpg",
        autoNext: true,
        record: false,
      });

      await upsertStep(tx, bm.id, 1, {
        kind: RitualStepKind.INVOCATION,
        title: "Invocation",
        videoUrl: "/videos/bm/2-invocation.mp4",
        posterUrl: "/videos/bm/2-invocation.jpg",
        autoNext: true,
        record: false,
      });

      await upsertStep(tx, bm.id, 2, {
        kind: RitualStepKind.SILENCE,
        title: "Silence",
        videoUrl: "/videos/bm/3-silence.mp4",
        posterUrl: "/videos/bm/3-silence.jpg",
        autoNext: false, // User must explicitly proceed after silence
        record: true,
      });

      await upsertStep(tx, bm.id, 3, {
        kind: RitualStepKind.CLOSING,
        title: "Closing",
        videoUrl: "/videos/bm/4-closing.mp4",
        posterUrl: "/videos/bm/4-closing.jpg",
        autoNext: true,
        record: false,
      });

      // 2) Enochian -------------------------------------------------------------
      const en = await tx.ritual.upsert({
        where: { slug: "enochian" },
        update: {
          name: "Enochian Calling",
          purposeMd: `## Purpose

A **guided calling** inspired by historical Enochian work, focusing on attention, pacing, and silence.

This ritual recreates a fragment of John Dee's "angelic language" experiment.
Participants follow phonetic invocations designed to induce rhythmic focus and altered perception.

> "The language of angels is not meant to be understood—only spoken."`,
          historyMd: `## History

In the late 1500s, **John Dee**—court astronomer to Queen Elizabeth I—and **Edward Kelley** claimed to receive a divine language from angels through crystal scrying.

Their "Enochian" calls became foundational to ceremonial magic traditions:

- **1580s**: Dee and Kelley record the "Angelic Keys" in private journals
- **1800s**: The Golden Dawn incorporates Enochian into Western occultism
- **1900s**: Aleister Crowley popularizes simplified versions
- **Today**: Used in experimental contexts for focused attention states

**The linguistic puzzle**: Enochian has consistent grammar and vocabulary, yet defies translation.
Scholars debate whether it was channeled, invented, or something in between.`,
          requirements: [
            "Quiet space free from interruption",
            "Comfortable seated position",
            "Headphones (recommended for immersion)",
            "30 seconds of uninterrupted silence",
          ],
        },
        create: {
          slug: "enochian",
          name: "Enochian Calling",
          purposeMd: `## Purpose

A guided calling inspired by historical Enochian work.`,
          historyMd: `## History

Renaissance occult research meets linguistic invention.`,
          requirements: ["Quiet space", "Comfortable seat", "Headphones (recommended)"],
        },
        select: { id: true },
      });

      // Steps are 0-indexed
      await upsertStep(tx, en.id, 0, {
        kind: RitualStepKind.PREPARATION,
        title: "Preparation",
        videoUrl: "/videos/en/1-prep.mp4",
        posterUrl: "/videos/en/1-prep.jpg",
        autoNext: true,
        record: false,
      });

      await upsertStep(tx, en.id, 1, {
        kind: RitualStepKind.INVOCATION,
        title: "The First Key",
        videoUrl: "/videos/en/2-invocation.mp4",
        posterUrl: "/videos/en/2-invocation.jpg",
        autoNext: true,
        record: false,
      });

      await upsertStep(tx, en.id, 2, {
        kind: RitualStepKind.SILENCE,
        title: "Silence",
        videoUrl: "/videos/en/3-silence.mp4",
        posterUrl: "/videos/en/3-silence.jpg",
        autoNext: false,
        record: true,
      });

      await upsertStep(tx, en.id, 3, {
        kind: RitualStepKind.CLOSING,
        title: "Return",
        videoUrl: "/videos/en/4-closing.mp4",
        posterUrl: "/videos/en/4-closing.jpg",
        autoNext: true,
        record: false,
      });
    });
  } finally {
    if (shouldDisconnect) await prisma.$disconnect();
  }
}

// helper -----------------------------------------------------------------------

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
    where: { ritualId_order: { ritualId, order } },
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
