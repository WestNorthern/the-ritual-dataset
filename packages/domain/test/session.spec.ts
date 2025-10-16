import { describe, it, expect } from 'vitest';
import {
  RitualStepKind, createRitual, startSession, beginCurrentStep, completeCurrentStep,
  beginSilence, completeSilenceWithRecording
} from '../src';
import { mkId, nowIso, mkWitnesses } from './util';
import type { Recording } from '../src';

const mkRitual = () => createRitual({
  id: mkId(), slug: 'bloody-mary', title: 'Bloody Mary',
  steps: [
    { id: mkId(), order: 0, kind: RitualStepKind.Preparation, name: 'Prep' },
    { id: mkId(), order: 1, kind: RitualStepKind.Invocation,  name: 'Invoke' },
    { id: mkId(), order: 2, kind: RitualStepKind.Silence,     name: 'Silence' }, // default 30s
    { id: mkId(), order: 3, kind: RitualStepKind.Closing,     name: 'Close' },
  ]
});

describe('session happy path', () => {
  it('walks steps and attaches recording in silence', () => {
    const ritual = mkRitual();
    const { creatorId, witnessIds } = mkWitnesses(1);
    const s = startSession({
      id: mkId(), ritual, witnessIds, createdBy: creatorId, now: nowIso()
    });

    beginCurrentStep(s, ritual, nowIso());            // Prep
    completeCurrentStep(s, ritual, nowIso());
    beginCurrentStep(s, ritual, nowIso());            // Invocation
    completeCurrentStep(s, ritual, nowIso());
    beginSilence(s, ritual, nowIso());

    const rec: Recording = {
    id: mkId(),
    sessionId: s.id,
    kind: 'AUDIO',
    silenceStepOrder: 2,
    durationSec: 30,
    sampleRateHz: 48000,
    channels: 1,
    codec: 'audio/webm;codecs=opus',
    byteSize: 123456,
    createdAt: nowIso()
    };

    completeSilenceWithRecording(s, ritual, rec, nowIso());
    beginCurrentStep(s, ritual, nowIso());            // Closing
    completeCurrentStep(s, ritual, nowIso());

    expect(s.status).toBe('COMPLETED');
    expect(s.recording?.durationSec).toBe(30);
  });
});
