import { describe, it, expect } from 'vitest';
import { createWitness, withAlias, withFullName } from '../src';
import { mkId, nowIso } from './util';

describe('witness', () => {
  it('creates with alias and optional fullName', () => {
    const w = createWitness({ id: mkId(), alias: 'ryan', fullName: 'Ryan R', now: nowIso() });
    expect(w.alias).toBe('ryan');
    expect(w.fullName).toBe('Ryan R');
  });

  it('trims and clears empty fullName', () => {
    const w = createWitness({ id: mkId(), alias: 'ryan', fullName: '   ', now: nowIso() });
    expect(w.fullName).toBeUndefined();
  });

  it('setters keep invariants', () => {
    let w = createWitness({ id: mkId(), alias: 'ryan', now: nowIso() });
    w = withAlias(w, ' new ');
    w = withFullName(w, '  Ryan R ');
    expect(w.alias).toBe('new');
    expect(w.fullName).toBe('Ryan R');
  });
});
