import { ISODateTime, UUID, Witness } from '../types';

export function createWitness(params: {
  id: UUID;
  alias: string;
  now: ISODateTime;
  fullName?: string;       // NEW
}): Witness {
  const alias = params.alias?.trim();
  if (!alias) throw new Error('Alias required');

  const fullName = params.fullName?.trim();
  return {
    id: params.id,
    alias,
    fullName: fullName || undefined,
    createdAt: params.now,
  };
}

// Optional helpers (pure, immutable style)
export function withAlias(w: Witness, alias: string): Witness {
  const a = alias.trim();
  if (!a) throw new Error('Alias required');
  return { ...w, alias: a };
}

export function withFullName(w: Witness, fullName?: string): Witness {
  const n = fullName?.trim();
  return { ...w, fullName: n || undefined };
}
