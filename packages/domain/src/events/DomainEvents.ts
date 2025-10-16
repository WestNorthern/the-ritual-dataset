// minimalist synchronous event types (infra will map to bus/telemetry later)
import { ISODateTime, UUID } from '../types';

export type DomainEventBase = {
  id: UUID;
  occurredAt: ISODateTime;
  sessionId?: UUID;
  kind: string;
};
