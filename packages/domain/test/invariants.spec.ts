import { describe, it, expect } from 'vitest';
import {
  RitualStepKind, createRitual, startSession, beginCurrentStep,
  completeCurrentStep, completeSilenceWithRecording
} from '../src';
import { mkId, nowIso, mkWitnesses } from './util';
import type { Recording } from '../src';

const mkRitual = () => createRitual({
  id: mkId(), slug: 'enochian', title: 'Enochian',
  steps: [
    { id: mkId(), order: 0, kind: RitualStepKind.Preparation, name: 'Prep' },
    { id: mkId(), order: 1, kind: RitualStepKind.Invocation,  name: 'Invoke' },
    { id: mkId(), order: 2, kind: RitualStepKind.Silence,     name: 'Silence', durationSec: 30 },
    { id: mkId(), order: 3, kind: RitualStepKind.Closing,     name: 'Close' },
  ]
});

describe('invariants', () => {
  it('cannot complete step before starting', () => {
    const r = mkRitual();
    const { creatorId, witnessIds } = mkWitnesses(1);
    const s = startSession({ id: mkId(), ritual: r, witnessIds, createdBy: creatorId, now: nowIso() });
    expect(() => completeCurrentStep(s, r, nowIso())).toThrow();
  });

  it('cannot attach two recordings', () => {
    const r = mkRitual();
    const { creatorId, witnessIds } = mkWitnesses(1);
    const s = startSession({ id: mkId(), ritual: r, witnessIds, createdBy: creatorId, now: nowIso() });

    // Prep (0)
    beginCurrentStep(s, r, nowIso());
    completeCurrentStep(s, r, nowIso());

    // Invocation (1)
    beginCurrentStep(s, r, nowIso());
    completeCurrentStep(s, r, nowIso());

    // Silence (2)
    beginCurrentStep(s, r, nowIso());

    const rec: Recording = {
    id: mkId(),
    sessionId: s.id,
    kind: 'AUDIO',
    silenceStepOrder: 2,
    durationSec: 30,
    sampleRateHz: 48000,
    channels: 1,
    codec: 'audio/webm;codecs=opus',
    byteSize: 42,
    createdAt: nowIso()
    };

    completeSilenceWithRecording(s, r, rec, nowIso());
    expect(() => completeSilenceWithRecording(s, r, rec, nowIso())).toThrow();
  });
});
