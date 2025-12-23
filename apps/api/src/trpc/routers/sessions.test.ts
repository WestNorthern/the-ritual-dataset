import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { sessionsRouter } from "./sessions.js";

// --- Mocks -------------------------------------------------------------------

vi.mock("../../prisma.js", () => ({
  prisma: {
    ritual: { findUnique: vi.fn() },
    session: { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    sessionStep: { update: vi.fn() },
    recording: { create: vi.fn() },
    survey: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "../../prisma.js";

// --- Helpers -----------------------------------------------------------------

type PartialCtx = {
  req?: any;
  reply?: any;
};

function makeCtx(wid?: string): PartialCtx {
  return {
    req: wid ? { jwtVerify: vi.fn().mockResolvedValue({ wid }) } : {},
    reply: {},
  };
}

function makeAuthCtx() {
  return makeCtx(WITNESS_ID);
}

// Valid CUID format for tests (25 chars starting with 'c')
const RITUAL_ID = "clr1234567890123456789012";
const SESSION_ID = "cls1234567890123456789012";
const WITNESS_ID = "clw1234567890123456789012";

const mockRitualWithSteps = {
  id: RITUAL_ID,
  slug: "bloody-mary",
  name: "Bloody Mary",
  purposeMd: "Purpose",
  historyMd: "History",
  requirements: ["Mirror"],
  steps: [
    { id: "clrs012345678901234567890", order: 0, kind: "PREPARATION", title: "Prep", videoUrl: "1.mp4", posterUrl: null, autoNext: true, record: false },
    { id: "clrs112345678901234567890", order: 1, kind: "INVOCATION", title: "Invoke", videoUrl: "2.mp4", posterUrl: null, autoNext: true, record: false },
    { id: "clrs212345678901234567890", order: 2, kind: "SILENCE", title: "Silence", videoUrl: "3.mp4", posterUrl: null, autoNext: false, record: true },
    { id: "clrs312345678901234567890", order: 3, kind: "CLOSING", title: "Close", videoUrl: "4.mp4", posterUrl: null, autoNext: true, record: false },
  ],
};

const mockSession = {
  id: SESSION_ID,
  ritualId: RITUAL_ID,
  witnessId: WITNESS_ID,
  status: "IN_PROGRESS",
  currentStepOrder: 0,
  ritual: mockRitualWithSteps,
  steps: [
    { id: "clss012345678901234567890", order: 0, ritualStepId: "clrs012345678901234567890", startedAt: null, completedAt: null },
    { id: "clss112345678901234567890", order: 1, ritualStepId: "clrs112345678901234567890", startedAt: null, completedAt: null },
    { id: "clss212345678901234567890", order: 2, ritualStepId: "clrs212345678901234567890", startedAt: null, completedAt: null },
    { id: "clss312345678901234567890", order: 3, ritualStepId: "clrs312345678901234567890", startedAt: null, completedAt: null },
  ],
  recording: null,
  survey: null,
};

beforeEach(() => {
  vi.resetAllMocks();
});

// --- Tests -------------------------------------------------------------------

describe("sessions.start", () => {
  it("throws UNAUTHORIZED if no JWT", async () => {
    const ctx = makeCtx(); // no wid

    await expect(
      sessionsRouter.createCaller(ctx as any).start({ ritualId: RITUAL_ID })
    ).rejects.toThrow(TRPCError);
  });

  it("throws NOT_FOUND if ritual does not exist", async () => {
    (prisma.ritual.findUnique as any).mockResolvedValue(null);
    const ctx = makeAuthCtx();

    await expect(
      sessionsRouter.createCaller(ctx as any).start({ ritualId: RITUAL_ID })
    ).rejects.toThrow("Ritual not found");
  });

  it("throws BAD_REQUEST if ritual has no steps", async () => {
    (prisma.ritual.findUnique as any).mockResolvedValue({ ...mockRitualWithSteps, steps: [] });
    const ctx = makeAuthCtx();

    await expect(
      sessionsRouter.createCaller(ctx as any).start({ ritualId: RITUAL_ID })
    ).rejects.toThrow("Ritual has no steps");
  });

  it("creates session with step tracking records", async () => {
    (prisma.ritual.findUnique as any).mockResolvedValue(mockRitualWithSteps);
    (prisma.session.create as any).mockResolvedValue({ id: SESSION_ID });
    const ctx = makeAuthCtx();

    const res = await sessionsRouter.createCaller(ctx as any).start({ ritualId: RITUAL_ID });

    expect(res).toEqual({ id: SESSION_ID });
    expect(prisma.session.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ritualId: RITUAL_ID,
          witnessId: WITNESS_ID,
          status: "IN_PROGRESS",
          currentStepOrder: 0,
        }),
      })
    );
  });
});

describe("sessions.getRunner", () => {
  it("throws UNAUTHORIZED if no JWT", async () => {
    const ctx = makeCtx();

    await expect(
      sessionsRouter.createCaller(ctx as any).getRunner({ sessionId: SESSION_ID })
    ).rejects.toThrow(TRPCError);
  });

  it("throws NOT_FOUND if session does not exist", async () => {
    (prisma.session.findUnique as any).mockResolvedValue(null);
    const ctx = makeAuthCtx();

    await expect(
      sessionsRouter.createCaller(ctx as any).getRunner({ sessionId: SESSION_ID })
    ).rejects.toThrow("Session not found");
  });

  it("throws FORBIDDEN if session belongs to different witness", async () => {
    const otherWitnessId = "clo1234567890123456789012";
    (prisma.session.findUnique as any).mockResolvedValue({ ...mockSession, witnessId: otherWitnessId });
    const ctx = makeAuthCtx();

    await expect(
      sessionsRouter.createCaller(ctx as any).getRunner({ sessionId: SESSION_ID })
    ).rejects.toThrow(TRPCError);
  });

  it("returns session data for runner UI", async () => {
    (prisma.session.findUnique as any).mockResolvedValue(mockSession);
    const ctx = makeAuthCtx();

    const res = await sessionsRouter.createCaller(ctx as any).getRunner({ sessionId: SESSION_ID });

    expect(res.sessionId).toBe(SESSION_ID);
    expect(res.status).toBe("IN_PROGRESS");
    expect(res.currentStepOrder).toBe(0);
    expect(res.ritual.steps).toHaveLength(4);
    expect(res.steps).toHaveLength(4);
    expect(res.hasRecording).toBe(false);
    expect(res.hasSurvey).toBe(false);
  });
});

describe("sessions.beginStep", () => {
  it("starts the current step and returns ok", async () => {
    (prisma.session.findUnique as any).mockResolvedValue(mockSession);
    (prisma.$transaction as any).mockResolvedValue([]);
    const ctx = makeAuthCtx();

    const res = await sessionsRouter.createCaller(ctx as any).beginStep({ sessionId: SESSION_ID });

    expect(res.ok).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("is idempotent if step already started", async () => {
    const startedSession = {
      ...mockSession,
      steps: [
        { ...mockSession.steps[0], startedAt: new Date() },
        ...mockSession.steps.slice(1),
      ],
    };
    (prisma.session.findUnique as any).mockResolvedValue(startedSession);
    const ctx = makeAuthCtx();

    const res = await sessionsRouter.createCaller(ctx as any).beginStep({ sessionId: SESSION_ID });

    expect(res.ok).toBe(true);
    expect(res.alreadyStarted).toBe(true);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("throws if session is completed", async () => {
    (prisma.session.findUnique as any).mockResolvedValue({ ...mockSession, status: "COMPLETED" });
    const ctx = makeAuthCtx();

    await expect(
      sessionsRouter.createCaller(ctx as any).beginStep({ sessionId: SESSION_ID })
    ).rejects.toThrow("Session is not active");
  });
});

describe("sessions.completeStep", () => {
  it("throws if step not started", async () => {
    (prisma.session.findUnique as any).mockResolvedValue(mockSession);
    const ctx = makeAuthCtx();

    await expect(
      sessionsRouter.createCaller(ctx as any).completeStep({ sessionId: SESSION_ID })
    ).rejects.toThrow("Step must be started first");
  });

  it("completes step and advances to next", async () => {
    const startedSession = {
      ...mockSession,
      steps: [
        { ...mockSession.steps[0], startedAt: new Date() },
        ...mockSession.steps.slice(1),
      ],
    };
    (prisma.session.findUnique as any).mockResolvedValue(startedSession);
    (prisma.$transaction as any).mockResolvedValue([]);
    const ctx = makeAuthCtx();

    const res = await sessionsRouter.createCaller(ctx as any).completeStep({ sessionId: SESSION_ID });

    expect(res.ok).toBe(true);
    expect(res.isCompleted).toBe(false);
    expect(res.nextStepOrder).toBe(1);
  });

  it("marks session as COMPLETED on last step", async () => {
    const lastStepSession = {
      ...mockSession,
      currentStepOrder: 3, // Last step (Closing)
      steps: [
        { ...mockSession.steps[0], startedAt: new Date(), completedAt: new Date() },
        { ...mockSession.steps[1], startedAt: new Date(), completedAt: new Date() },
        { ...mockSession.steps[2], startedAt: new Date(), completedAt: new Date() },
        { ...mockSession.steps[3], startedAt: new Date() }, // Started but not completed
      ],
    };
    (prisma.session.findUnique as any).mockResolvedValue(lastStepSession);
    (prisma.$transaction as any).mockResolvedValue([]);
    const ctx = makeAuthCtx();

    const res = await sessionsRouter.createCaller(ctx as any).completeStep({ sessionId: SESSION_ID });

    expect(res.ok).toBe(true);
    expect(res.isCompleted).toBe(true);
    expect(res.nextStepOrder).toBeNull();
  });
});

describe("sessions.submitRecording", () => {
  it("throws if recording already exists", async () => {
    (prisma.session.findUnique as any).mockResolvedValue({
      ...mockSession,
      recording: { id: "clrec12345678901234567890" },
    });
    const ctx = makeAuthCtx();

    await expect(
      sessionsRouter.createCaller(ctx as any).submitRecording({
        sessionId: SESSION_ID,
        silenceStepOrder: 2,
        durationSec: 30,
        silenceDetected: true,
      })
    ).rejects.toThrow("Recording already submitted");
  });

  it("creates recording metadata", async () => {
    (prisma.session.findUnique as any).mockResolvedValue(mockSession);
    (prisma.recording.create as any).mockResolvedValue({ id: "clrec12345678901234567890", silenceDetected: true });
    const ctx = makeAuthCtx();

    const res = await sessionsRouter.createCaller(ctx as any).submitRecording({
      sessionId: SESSION_ID,
      silenceStepOrder: 2,
      durationSec: 30,
      sampleRateHz: 48000,
      channels: 1,
      codec: "audio/webm;codecs=opus",
      byteSize: 12345,
      silenceDetected: true,
    });

    expect(res.ok).toBe(true);
    expect(res.recordingId).toBe("clrec12345678901234567890");
    expect(res.silenceDetected).toBe(true);
  });
});

describe("sessions.submitSurvey", () => {
  it("throws if session not completed", async () => {
    (prisma.session.findUnique as any).mockResolvedValue(mockSession); // status: IN_PROGRESS
    const ctx = makeAuthCtx();

    await expect(
      sessionsRouter.createCaller(ctx as any).submitSurvey({
        sessionId: SESSION_ID,
        presenceRating: 4,
      })
    ).rejects.toThrow("Session must be completed first");
  });

  it("throws if survey already submitted", async () => {
    (prisma.session.findUnique as any).mockResolvedValue({
      ...mockSession,
      status: "COMPLETED",
      survey: { id: "clsur12345678901234567890" },
    });
    const ctx = makeAuthCtx();

    await expect(
      sessionsRouter.createCaller(ctx as any).submitSurvey({
        sessionId: SESSION_ID,
        presenceRating: 4,
      })
    ).rejects.toThrow("Survey already submitted");
  });

  it("creates survey with rating and notes", async () => {
    (prisma.session.findUnique as any).mockResolvedValue({
      ...mockSession,
      status: "COMPLETED",
      survey: null,
    });
    (prisma.survey.create as any).mockResolvedValue({ id: "clsur12345678901234567890" });
    const ctx = makeAuthCtx();

    const res = await sessionsRouter.createCaller(ctx as any).submitSurvey({
      sessionId: SESSION_ID,
      presenceRating: 4,
      notes: "Felt something strange",
    });

    expect(res.ok).toBe(true);
    expect(res.surveyId).toBe("clsur12345678901234567890");
    expect(prisma.survey.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sessionId: SESSION_ID,
          presenceRating: 4,
          notes: "Felt something strange",
        }),
      })
    );
  });
});

describe("sessions.list", () => {
  it("returns empty array when user has no sessions", async () => {
    (prisma.session.findMany as any).mockResolvedValue([]);
    const ctx = makeAuthCtx();

    const res = await sessionsRouter.createCaller(ctx as any).list();

    expect(res).toEqual([]);
    expect(prisma.session.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { witnessId: WITNESS_ID },
      })
    );
  });

  it("returns sessions with ritual info and survey data", async () => {
    (prisma.session.findMany as any).mockResolvedValue([
      {
        id: "cls1234567890123456789012",
        status: "COMPLETED",
        createdAt: new Date("2024-01-01"),
        ritual: { id: RITUAL_ID, name: "Bloody Mary", slug: "bloody-mary" },
        survey: { presenceRating: 4 },
        recording: { silenceDetected: true },
      },
      {
        id: "cls2234567890123456789012",
        status: "IN_PROGRESS",
        createdAt: new Date("2024-01-02"),
        ritual: { id: RITUAL_ID, name: "Bloody Mary", slug: "bloody-mary" },
        survey: null,
        recording: null,
      },
    ]);
    const ctx = makeAuthCtx();

    const res = await sessionsRouter.createCaller(ctx as any).list();

    expect(res).toHaveLength(2);
    expect(res[0]).toEqual({
      id: "cls1234567890123456789012",
      status: "COMPLETED",
      createdAt: "2024-01-01T00:00:00.000Z",
      ritual: { id: RITUAL_ID, name: "Bloody Mary", slug: "bloody-mary" },
      presenceRating: 4,
      silenceDetected: true,
    });
    expect(res[1].presenceRating).toBeNull();
    expect(res[1].silenceDetected).toBeNull();
  });
});

describe("sessions.cancel", () => {
  it("cancels an active session", async () => {
    (prisma.session.findUnique as any).mockResolvedValue(mockSession);
    (prisma.session.update as any).mockResolvedValue({});
    const ctx = makeAuthCtx();

    const res = await sessionsRouter.createCaller(ctx as any).cancel({ sessionId: SESSION_ID });

    expect(res.ok).toBe(true);
    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { id: SESSION_ID },
      data: { status: "CANCELLED" },
    });
  });

  it("is idempotent for already finished sessions", async () => {
    (prisma.session.findUnique as any).mockResolvedValue({ ...mockSession, status: "COMPLETED" });
    const ctx = makeAuthCtx();

    const res = await sessionsRouter.createCaller(ctx as any).cancel({ sessionId: SESSION_ID });

    expect(res.ok).toBe(true);
    expect(res.alreadyFinished).toBe(true);
    expect(prisma.session.update).not.toHaveBeenCalled();
  });
});

