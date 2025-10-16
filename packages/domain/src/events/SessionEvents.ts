import { DomainEventBase } from './DomainEvents';
import { UUID, ISODateTime, RitualStepKind, PresenceRating } from '../types';

export type SessionStarted = DomainEventBase & {
  kind: 'SessionStarted';
  sessionId: UUID;
  ritualId: UUID;
  witnessIds: UUID[];
};

export type StepBegan = DomainEventBase & {
  kind: 'StepBegan';
  sessionId: UUID;
  order: number;
  stepKind: RitualStepKind;
};

export type StepCompleted = DomainEventBase & {
  kind: 'StepCompleted';
  sessionId: UUID;
  order: number;
  stepKind: RitualStepKind;
};

export type SilenceBegan = DomainEventBase & {
  kind: 'SilenceBegan';
  sessionId: UUID;
  order: number;
  expectedDurationSec: number;
};

export type SilenceCompleted = DomainEventBase & {
  kind: 'SilenceCompleted';
  sessionId: UUID;
  order: number;
  actualDurationSec: number;
  recordingId: UUID;
};

export type SessionCompleted = DomainEventBase & {
  kind: 'SessionCompleted';
  sessionId: UUID;
};

export type SurveySubmitted = DomainEventBase & {
  kind: 'SurveySubmitted';
  sessionId: UUID;
  presenceRating: PresenceRating;
};
