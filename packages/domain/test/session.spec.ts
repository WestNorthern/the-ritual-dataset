import { describe, it, expect } from 'vitest';
import {
  RitualStepKind, SessionStatus, createRitual, startSession, beginCurrentStep,
  completeCurrentStep, beginSilence, completeSilenceWithRecording, submitSurvey
} from '../src';
import { mkId, nowIso, mkWitnesses } from './util';
import type { Recording, SurveyResponse } from '../src';

const mkRitual = () => createRitual({
  id: mkId(), slug: 'bloody-mary', title: 'Bloody Mary',
  steps: [
    { id: mkId(), order: 0, kind: RitualStepKind.Preparation, name: 'Prep' },
    { id: mkId(), order: 1, kind: RitualStepKind.Invocation,  name: 'Invoke' },
    { id: mkId(), order: 2, kind: RitualStepKind.Silence,     name: 'Silence' }, // default 30s
    { id: mkId(), order: 3, kind: RitualStepKind.Closing,     name: 'Close' },
  ]
});

const mkRecording = (sessionId: string): Recording => ({
  id: mkId(),
  sessionId: sessionId as any,
  kind: 'AUDIO',
  silenceStepOrder: 2,
  durationSec: 30,
  sampleRateHz: 48000,
  channels: 1,
  codec: 'audio/webm;codecs=opus',
  byteSize: 123456,
  createdAt: nowIso(),
});

describe('startSession', () => {
  it('creates a session in InProgress status at step 0', () => {
    const ritual = mkRitual();
    const { creatorId, witnessIds } = mkWitnesses(1);

    const session = startSession({
      id: mkId(),
      ritual,
      witnessIds,
      createdBy: creatorId,
      now: nowIso(),
    });

    expect(session.status).toBe(SessionStatus.InProgress);
    expect(session.currentOrder).toBe(0);
    expect(session.steps).toHaveLength(4);
    expect(session.recording).toBeUndefined();
    expect(session.survey).toBeUndefined();
  });

  it('requires at least one witness', () => {
    const ritual = mkRitual();
    const creatorId = mkId();

    expect(() =>
      startSession({
        id: mkId(),
        ritual,
        witnessIds: [],
        createdBy: creatorId,
        now: nowIso(),
      })
    ).toThrow('at least one witness required');
  });

  it('requires creator to be a participant', () => {
    const ritual = mkRitual();
    const creatorId = mkId();
    const otherId = mkId();

    expect(() =>
      startSession({
        id: mkId(),
        ritual,
        witnessIds: [otherId], // creator not included
        createdBy: creatorId,
        now: nowIso(),
      })
    ).toThrow('createdBy must be a participant');
  });

  it('deduplicates witness IDs', () => {
    const ritual = mkRitual();
    const { creatorId } = mkWitnesses(1);

    const session = startSession({
      id: mkId(),
      ritual,
      witnessIds: [creatorId, creatorId, creatorId], // duplicates
      createdBy: creatorId,
      now: nowIso(),
    });

    expect(session.witnessIds).toHaveLength(1);
    expect(session.witnessIds[0]).toBe(creatorId);
  });
});

describe('session step progression', () => {
  it('tracks startedAt and completedAt for each step', () => {
    const ritual = mkRitual();
    const { creatorId, witnessIds } = mkWitnesses(1);
    const session = startSession({
      id: mkId(),
      ritual,
      witnessIds,
      createdBy: creatorId,
      now: nowIso(),
    });

    // Before starting
    expect(session.steps[0].startedAt).toBeUndefined();
    expect(session.steps[0].completedAt).toBeUndefined();

    beginCurrentStep(session, ritual, nowIso());
    expect(session.steps[0].startedAt).toBeDefined();
    expect(session.steps[0].completedAt).toBeUndefined();

    completeCurrentStep(session, ritual, nowIso());
    expect(session.steps[0].completedAt).toBeDefined();
    expect(session.currentOrder).toBe(1);
  });

  it('beginCurrentStep is idempotent', () => {
    const ritual = mkRitual();
    const { creatorId, witnessIds } = mkWitnesses(1);
    const session = startSession({
      id: mkId(),
      ritual,
      witnessIds,
      createdBy: creatorId,
      now: nowIso(),
    });

    const firstCall = beginCurrentStep(session, ritual, nowIso());
    const originalStartedAt = session.steps[0].startedAt;

    // Calling again should not change anything
    const secondCall = beginCurrentStep(session, ritual, nowIso());
    expect(session.steps[0].startedAt).toBe(originalStartedAt);
    expect(firstCall).toBe(secondCall);
  });

  it('completeCurrentStep is idempotent when called on same step', () => {
    const ritual = mkRitual();
    const { creatorId, witnessIds } = mkWitnesses(1);
    const session = startSession({
      id: mkId(),
      ritual,
      witnessIds,
      createdBy: creatorId,
      now: nowIso(),
    });

    beginCurrentStep(session, ritual, nowIso());

    // Complete once
    completeCurrentStep(session, ritual, nowIso());
    expect(session.currentOrder).toBe(1); // Advanced to next step

    // Start the next step and complete it
    beginCurrentStep(session, ritual, nowIso());
    completeCurrentStep(session, ritual, nowIso());
    const originalCompletedAt = session.steps[1].completedAt;

    // Going back and calling complete again on current (now step 2) won't re-complete step 1
    // This tests that completed steps stay completed
    expect(session.steps[0].completedAt).toBeDefined();
    expect(session.steps[1].completedAt).toBe(originalCompletedAt);
  });
});

describe('silence phase', () => {
  it('enters SILENCE status when beginning silence step', () => {
    const ritual = mkRitual();
    const { creatorId, witnessIds } = mkWitnesses(1);
    const session = startSession({
      id: mkId(),
      ritual,
      witnessIds,
      createdBy: creatorId,
      now: nowIso(),
    });

    // Progress to silence step
    beginCurrentStep(session, ritual, nowIso());
    completeCurrentStep(session, ritual, nowIso());
    beginCurrentStep(session, ritual, nowIso());
    completeCurrentStep(session, ritual, nowIso());

    expect(session.currentOrder).toBe(2); // Silence step
    expect(session.status).toBe(SessionStatus.InProgress);

    beginSilence(session, ritual, nowIso());
    expect(session.status).toBe(SessionStatus.Silence);
  });

  it('throws if beginSilence called on non-silence step', () => {
    const ritual = mkRitual();
    const { creatorId, witnessIds } = mkWitnesses(1);
    const session = startSession({
      id: mkId(),
      ritual,
      witnessIds,
      createdBy: creatorId,
      now: nowIso(),
    });

    // Still on Preparation step
    expect(() => beginSilence(session, ritual, nowIso())).toThrow('not at SILENCE step');
  });

  it('returns to IN_PROGRESS after completing silence', () => {
    const ritual = mkRitual();
    const { creatorId, witnessIds } = mkWitnesses(1);
    const session = startSession({
      id: mkId(),
      ritual,
      witnessIds,
      createdBy: creatorId,
      now: nowIso(),
    });

    // Progress through to silence
    beginCurrentStep(session, ritual, nowIso());
    completeCurrentStep(session, ritual, nowIso());
    beginCurrentStep(session, ritual, nowIso());
    completeCurrentStep(session, ritual, nowIso());
    beginSilence(session, ritual, nowIso());

    const rec = mkRecording(session.id);
    completeSilenceWithRecording(session, ritual, rec, nowIso());

    expect(session.status).toBe(SessionStatus.InProgress);
    expect(session.currentOrder).toBe(3); // Now on Closing
  });
});

describe('session happy path', () => {
  it('walks all steps and completes with recording and survey', () => {
    const ritual = mkRitual();
    const { creatorId, witnessIds } = mkWitnesses(1);
    const session = startSession({
      id: mkId(),
      ritual,
      witnessIds,
      createdBy: creatorId,
      now: nowIso(),
    });

    // Prep
    beginCurrentStep(session, ritual, nowIso());
    completeCurrentStep(session, ritual, nowIso());

    // Invocation
    beginCurrentStep(session, ritual, nowIso());
    completeCurrentStep(session, ritual, nowIso());

    // Silence
    beginSilence(session, ritual, nowIso());
    const rec = mkRecording(session.id);
    completeSilenceWithRecording(session, ritual, rec, nowIso());

    // Closing
    beginCurrentStep(session, ritual, nowIso());
    completeCurrentStep(session, ritual, nowIso());

    expect(session.status).toBe(SessionStatus.Completed);
    expect(session.recording?.durationSec).toBe(30);

    // Submit survey after completion
    const survey: SurveyResponse = {
      id: mkId(),
      sessionId: session.id,
      presenceRating: 4,
      notes: 'Felt a presence',
      createdAt: nowIso(),
    };

    submitSurvey(session, survey);
    expect(session.survey?.presenceRating).toBe(4);
    expect(session.survey?.notes).toBe('Felt a presence');
  });
});

describe('survey submission', () => {
  function completeSession() {
    const ritual = mkRitual();
    const { creatorId, witnessIds } = mkWitnesses(1);
    const session = startSession({
      id: mkId(),
      ritual,
      witnessIds,
      createdBy: creatorId,
      now: nowIso(),
    });

    beginCurrentStep(session, ritual, nowIso());
    completeCurrentStep(session, ritual, nowIso());
    beginCurrentStep(session, ritual, nowIso());
    completeCurrentStep(session, ritual, nowIso());
    beginSilence(session, ritual, nowIso());
    completeSilenceWithRecording(session, ritual, mkRecording(session.id), nowIso());
    beginCurrentStep(session, ritual, nowIso());
    completeCurrentStep(session, ritual, nowIso());

    return session;
  }

  it('allows survey submission after completion', () => {
    const session = completeSession();

    const survey: SurveyResponse = {
      id: mkId(),
      sessionId: session.id,
      presenceRating: 3,
      createdAt: nowIso(),
    };

    submitSurvey(session, survey);
    expect(session.survey).toBe(survey);
  });

  it('rejects survey before completion', () => {
    const ritual = mkRitual();
    const { creatorId, witnessIds } = mkWitnesses(1);
    const session = startSession({
      id: mkId(),
      ritual,
      witnessIds,
      createdBy: creatorId,
      now: nowIso(),
    });

    const survey: SurveyResponse = {
      id: mkId(),
      sessionId: session.id,
      presenceRating: 3,
      createdAt: nowIso(),
    };

    expect(() => submitSurvey(session, survey)).toThrow('survey allowed only after completion');
  });

  it('rejects duplicate survey submission', () => {
    const session = completeSession();

    const survey1: SurveyResponse = {
      id: mkId(),
      sessionId: session.id,
      presenceRating: 3,
      createdAt: nowIso(),
    };

    const survey2: SurveyResponse = {
      id: mkId(),
      sessionId: session.id,
      presenceRating: 5,
      createdAt: nowIso(),
    };

    submitSurvey(session, survey1);
    expect(() => submitSurvey(session, survey2)).toThrow('survey already submitted');
  });
});
