import { Ritual, RitualStep, RitualStepKind, UUID } from '../types';

export function createRitual(params: {
  id: UUID;
  slug: string;
  title: string;
  steps: RitualStep[];
}): Ritual {
  if (!/^[a-z0-9-]+$/.test(params.slug)) throw new Error('slug must be kebab-case');
  if (!params.steps.length) throw new Error('ritual must have steps');
  // Validate contiguous order and required kinds presence
  const orders = params.steps.map(s => s.order).sort((a,b)=>a-b);
  orders.forEach((o, i) => { if (o !== i) throw new Error('steps must have contiguous order starting at 0'); });

  const hasPrep = params.steps.some(s => s.kind === RitualStepKind.Preparation);
  const hasInv  = params.steps.some(s => s.kind === RitualStepKind.Invocation);
  const hasSil  = params.steps.some(s => s.kind === RitualStepKind.Silence);
  const hasClose= params.steps.some(s => s.kind === RitualStepKind.Closing);
  if (!hasPrep || !hasInv || !hasSil || !hasClose) throw new Error('ritual must include required steps');

  // Default silence duration to 30s if omitted
  params.steps = params.steps.map(s =>
    s.kind === RitualStepKind.Silence && !s.durationSec ? { ...s, durationSec: 30 } : s
  );

  return { ...params, steps: params.steps };
}
