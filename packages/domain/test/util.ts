import { randomUUID } from 'node:crypto';
import type { UUID, ISODateTime } from '../src';

export const mkId = (): UUID => randomUUID() as UUID;
export const nowIso = (): ISODateTime => new Date().toISOString() as ISODateTime;

/** Convenience: make a witness set where the creator is included */
export const mkWitnesses = (n = 1) => {
  const creatorId = mkId();
  const others = Array.from({ length: Math.max(0, n - 1) }, () => mkId());
  const witnessIds = [creatorId, ...others];
  return { creatorId, witnessIds };
};
