import { describe, it, expect } from 'vitest';
import { createRitual, RitualStepKind } from '../src';
import { mkId } from './util';

describe('createRitual', () => {
  const validSteps = [
    { id: mkId(), order: 0, kind: RitualStepKind.Preparation, name: 'Prep' },
    { id: mkId(), order: 1, kind: RitualStepKind.Invocation, name: 'Invoke' },
    { id: mkId(), order: 2, kind: RitualStepKind.Silence, name: 'Silence' },
    { id: mkId(), order: 3, kind: RitualStepKind.Closing, name: 'Close' },
  ];

  it('creates a valid ritual with all required step kinds', () => {
    const ritual = createRitual({
      id: mkId(),
      slug: 'test-ritual',
      title: 'Test Ritual',
      steps: validSteps,
    });

    expect(ritual.slug).toBe('test-ritual');
    expect(ritual.title).toBe('Test Ritual');
    expect(ritual.steps).toHaveLength(4);
  });

  it('defaults silence duration to 30s if not provided', () => {
    const ritual = createRitual({
      id: mkId(),
      slug: 'test-ritual',
      title: 'Test Ritual',
      steps: validSteps,
    });

    const silenceStep = ritual.steps.find(s => s.kind === RitualStepKind.Silence);
    expect(silenceStep?.durationSec).toBe(30);
  });

  it('preserves explicit silence duration', () => {
    const stepsWithDuration = validSteps.map(s =>
      s.kind === RitualStepKind.Silence ? { ...s, durationSec: 60 } : s
    );

    const ritual = createRitual({
      id: mkId(),
      slug: 'test-ritual',
      title: 'Test Ritual',
      steps: stepsWithDuration,
    });

    const silenceStep = ritual.steps.find(s => s.kind === RitualStepKind.Silence);
    expect(silenceStep?.durationSec).toBe(60);
  });

  describe('validation', () => {
    it('rejects non-kebab-case slugs', () => {
      expect(() =>
        createRitual({
          id: mkId(),
          slug: 'Test Ritual', // spaces not allowed
          title: 'Test Ritual',
          steps: validSteps,
        })
      ).toThrow('slug must be kebab-case');

      expect(() =>
        createRitual({
          id: mkId(),
          slug: 'TestRitual', // camelCase not allowed
          title: 'Test Ritual',
          steps: validSteps,
        })
      ).toThrow('slug must be kebab-case');
    });

    it('rejects empty steps', () => {
      expect(() =>
        createRitual({
          id: mkId(),
          slug: 'test-ritual',
          title: 'Test Ritual',
          steps: [],
        })
      ).toThrow('ritual must have steps');
    });

    it('rejects non-contiguous step orders', () => {
      const gappedSteps = [
        { id: mkId(), order: 0, kind: RitualStepKind.Preparation, name: 'Prep' },
        { id: mkId(), order: 2, kind: RitualStepKind.Invocation, name: 'Invoke' }, // gap!
        { id: mkId(), order: 3, kind: RitualStepKind.Silence, name: 'Silence' },
        { id: mkId(), order: 4, kind: RitualStepKind.Closing, name: 'Close' },
      ];

      expect(() =>
        createRitual({
          id: mkId(),
          slug: 'test-ritual',
          title: 'Test Ritual',
          steps: gappedSteps,
        })
      ).toThrow('steps must have contiguous order starting at 0');
    });

    it('rejects steps not starting at 0', () => {
      const offsetSteps = [
        { id: mkId(), order: 1, kind: RitualStepKind.Preparation, name: 'Prep' },
        { id: mkId(), order: 2, kind: RitualStepKind.Invocation, name: 'Invoke' },
        { id: mkId(), order: 3, kind: RitualStepKind.Silence, name: 'Silence' },
        { id: mkId(), order: 4, kind: RitualStepKind.Closing, name: 'Close' },
      ];

      expect(() =>
        createRitual({
          id: mkId(),
          slug: 'test-ritual',
          title: 'Test Ritual',
          steps: offsetSteps,
        })
      ).toThrow('steps must have contiguous order starting at 0');
    });

    it('rejects missing required step kinds', () => {
      // Missing Preparation
      const noPrep = [
        { id: mkId(), order: 0, kind: RitualStepKind.Invocation, name: 'Invoke' },
        { id: mkId(), order: 1, kind: RitualStepKind.Silence, name: 'Silence' },
        { id: mkId(), order: 2, kind: RitualStepKind.Closing, name: 'Close' },
      ];
      expect(() =>
        createRitual({ id: mkId(), slug: 'test', title: 'Test', steps: noPrep })
      ).toThrow('ritual must include required steps');

      // Missing Silence
      const noSilence = [
        { id: mkId(), order: 0, kind: RitualStepKind.Preparation, name: 'Prep' },
        { id: mkId(), order: 1, kind: RitualStepKind.Invocation, name: 'Invoke' },
        { id: mkId(), order: 2, kind: RitualStepKind.Closing, name: 'Close' },
      ];
      expect(() =>
        createRitual({ id: mkId(), slug: 'test', title: 'Test', steps: noSilence })
      ).toThrow('ritual must include required steps');
    });

    it('allows Extra step kind in addition to required steps', () => {
      const withExtra = [
        { id: mkId(), order: 0, kind: RitualStepKind.Preparation, name: 'Prep' },
        { id: mkId(), order: 1, kind: RitualStepKind.Extra, name: 'Visualization' },
        { id: mkId(), order: 2, kind: RitualStepKind.Invocation, name: 'Invoke' },
        { id: mkId(), order: 3, kind: RitualStepKind.Silence, name: 'Silence' },
        { id: mkId(), order: 4, kind: RitualStepKind.Closing, name: 'Close' },
      ];

      const ritual = createRitual({
        id: mkId(),
        slug: 'with-extra',
        title: 'With Extra',
        steps: withExtra,
      });

      expect(ritual.steps).toHaveLength(5);
      expect(ritual.steps.some(s => s.kind === RitualStepKind.Extra)).toBe(true);
    });
  });
});

