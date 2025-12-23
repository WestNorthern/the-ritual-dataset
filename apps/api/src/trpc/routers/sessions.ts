import type { FastifyRequest } from "fastify";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Context } from "../../trpc/context.js";
import { prisma } from "../../prisma.js";

const t = initTRPC.context<Context>().create();

// Type for Fastify request with JWT plugin
type JwtPayload = { wid: string };
type RequestWithJwt = FastifyRequest & {
  jwtVerify: <T = unknown>() => Promise<T>;
};

// helper: get wid from JWT
async function readWid(ctx: Context): Promise<string | null> {
  const req = ctx.req as Partial<RequestWithJwt>;
  if (typeof req.jwtVerify !== "function") return null;
  try {
    const payload = await req.jwtVerify<JwtPayload>();
    return payload?.wid ?? null;
  } catch {
    return null;
  }
}

// helper: require auth
async function requireWid(ctx: Context): Promise<string> {
  const wid = await readWid(ctx);
  if (!wid) throw new TRPCError({ code: "UNAUTHORIZED" });
  return wid;
}

// helper: get session with ownership check
async function getOwnedSession(sessionId: string, wid: string) {
  const s = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      ritual: { include: { steps: { orderBy: { order: "asc" } } } },
      steps: { orderBy: { order: "asc" } },
      recording: true,
      survey: true,
    },
  });
  if (!s) throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
  if (s.witnessId && s.witnessId !== wid) throw new TRPCError({ code: "FORBIDDEN" });
  return s;
}

export const sessionsRouter = t.router({
  /** Start a new session for a ritual */
  start: t.procedure
    .input(z.object({ ritualId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const wid = await requireWid(ctx);

      // Fetch ritual with steps to create SessionStep records
      const ritual = await prisma.ritual.findUnique({
        where: { id: input.ritualId },
        include: { steps: { orderBy: { order: "asc" } } },
      });
      if (!ritual) throw new TRPCError({ code: "NOT_FOUND", message: "Ritual not found" });
      if (ritual.steps.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Ritual has no steps" });
      }

      // Create session with step tracking
      const session = await prisma.session.create({
        data: {
          ritualId: ritual.id,
          witnessId: wid,
          status: "IN_PROGRESS",
          currentStepOrder: 0,
          steps: {
            create: ritual.steps.map((rs) => ({
              ritualStepId: rs.id,
              order: rs.order,
            })),
          },
        },
        select: { id: true },
      });

      return session;
    }),

  /** Get full session data for the runner UI */
  getRunner: t.procedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const wid = await requireWid(ctx);
      const s = await getOwnedSession(input.sessionId, wid);

      return {
        sessionId: s.id,
        status: s.status,
        currentStepOrder: s.currentStepOrder,
        ritual: {
          id: s.ritual.id,
          slug: s.ritual.slug,
          name: s.ritual.name,
          purposeMd: s.ritual.purposeMd,
          historyMd: s.ritual.historyMd,
          requirements: s.ritual.requirements,
          steps: s.ritual.steps.map((rs) => ({
            id: rs.id,
            kind: rs.kind,
            order: rs.order,
            title: rs.title,
            videoUrl: rs.videoUrl,
            posterUrl: rs.posterUrl,
            autoNext: rs.autoNext,
            record: rs.record,
          })),
        },
        steps: s.steps.map((ss) => ({
          order: ss.order,
          startedAt: ss.startedAt?.toISOString() ?? null,
          completedAt: ss.completedAt?.toISOString() ?? null,
        })),
        hasRecording: !!s.recording,
        hasSurvey: !!s.survey,
      };
    }),

  /** Mark the current step as started */
  beginStep: t.procedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const wid = await requireWid(ctx);
      const s = await getOwnedSession(input.sessionId, wid);

      if (s.status === "COMPLETED" || s.status === "CANCELLED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Session is not active" });
      }

      const currentStep = s.steps.find((st) => st.order === s.currentStepOrder);
      if (!currentStep) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Current step not found" });
      }

      // Idempotent: if already started, just return
      if (currentStep.startedAt) {
        return { ok: true, alreadyStarted: true };
      }

      // Check if this is the silence step
      const ritualStep = s.ritual.steps.find((rs) => rs.order === s.currentStepOrder);
      const isSilence = ritualStep?.kind === "SILENCE";

      await prisma.$transaction([
        prisma.sessionStep.update({
          where: { id: currentStep.id },
          data: { startedAt: new Date() },
        }),
        // If entering silence, update session status
        ...(isSilence
          ? [prisma.session.update({ where: { id: s.id }, data: { status: "SILENCE" } })]
          : []),
      ]);

      return { ok: true, isSilence };
    }),

  /** Mark the current step as completed and advance */
  completeStep: t.procedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const wid = await requireWid(ctx);
      const s = await getOwnedSession(input.sessionId, wid);

      if (s.status === "COMPLETED" || s.status === "CANCELLED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Session is not active" });
      }

      const currentStep = s.steps.find((st) => st.order === s.currentStepOrder);
      if (!currentStep) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Current step not found" });
      }

      if (!currentStep.startedAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Step must be started first" });
      }

      // Idempotent
      if (currentStep.completedAt) {
        return { ok: true, alreadyCompleted: true };
      }

      const isLastStep = s.currentStepOrder >= s.ritual.steps.length - 1;

      await prisma.$transaction([
        prisma.sessionStep.update({
          where: { id: currentStep.id },
          data: { completedAt: new Date() },
        }),
        prisma.session.update({
          where: { id: s.id },
          data: isLastStep
            ? { status: "COMPLETED" }
            : { status: "IN_PROGRESS", currentStepOrder: s.currentStepOrder + 1 },
        }),
      ]);

      return { ok: true, isCompleted: isLastStep, nextStepOrder: isLastStep ? null : s.currentStepOrder + 1 };
    }),

  /** Record metadata for the silence phase (MVP: no actual audio storage) */
  submitRecording: t.procedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        silenceStepOrder: z.number().int().min(0),
        durationSec: z.number().positive(),
        sampleRateHz: z.number().int().positive().default(48000),
        channels: z.number().int().min(1).max(2).default(1),
        codec: z.string().default("audio/webm;codecs=opus"),
        byteSize: z.number().int().nonnegative().default(0),
        silenceDetected: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const wid = await requireWid(ctx);
      const s = await getOwnedSession(input.sessionId, wid);

      if (s.recording) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Recording already submitted" });
      }

      const recording = await prisma.recording.create({
        data: {
          sessionId: s.id,
          silenceStepOrder: input.silenceStepOrder,
          durationSec: input.durationSec,
          sampleRateHz: input.sampleRateHz,
          channels: input.channels,
          codec: input.codec,
          byteSize: input.byteSize,
          silenceDetected: input.silenceDetected,
        },
        select: { id: true, silenceDetected: true },
      });

      return { ok: true, recordingId: recording.id, silenceDetected: recording.silenceDetected };
    }),

  /** Submit post-ritual survey */
  submitSurvey: t.procedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        presenceRating: z.number().int().min(0).max(5),
        notes: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const wid = await requireWid(ctx);
      const s = await getOwnedSession(input.sessionId, wid);

      if (s.survey) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Survey already submitted" });
      }

      if (s.status !== "COMPLETED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Session must be completed first" });
      }

      const survey = await prisma.survey.create({
        data: {
          sessionId: s.id,
          presenceRating: input.presenceRating,
          notes: input.notes,
        },
        select: { id: true },
      });

      return { ok: true, surveyId: survey.id };
    }),

  /** List user's sessions */
  list: t.procedure.query(async ({ ctx }) => {
    const wid = await requireWid(ctx);

    const sessions = await prisma.session.findMany({
      where: { witnessId: wid },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        createdAt: true,
        ritual: { select: { id: true, name: true, slug: true } },
        survey: { select: { presenceRating: true } },
        recording: { select: { silenceDetected: true } },
      },
    });

    return sessions.map((s) => ({
      id: s.id,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      ritual: s.ritual,
      presenceRating: s.survey?.presenceRating ?? null,
      silenceDetected: s.recording?.silenceDetected ?? null,
    }));
  }),

  /** Cancel an active session */
  cancel: t.procedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const wid = await requireWid(ctx);
      const s = await getOwnedSession(input.sessionId, wid);

      if (s.status === "COMPLETED" || s.status === "CANCELLED") {
        return { ok: true, alreadyFinished: true };
      }

      await prisma.session.update({
        where: { id: s.id },
        data: { status: "CANCELLED" },
      });

      return { ok: true };
    }),
});
