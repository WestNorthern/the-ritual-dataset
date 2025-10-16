// Domain core types (no infra libs)
export type ISODateTime = string & { readonly __brand: 'ISODateTime' };
export type UUID = string & { readonly __brand: 'UUID' };

export enum RitualStepKind {
  Preparation = 'PREPARATION',
  Invocation = 'INVOCATION',
  Extra = 'EXTRA',
  Silence = 'SILENCE',
  Closing = 'CLOSING',
}

export type RitualStep = {
  id: UUID;
  order: number;            // 0-based in ritual sequence
  kind: RitualStepKind;
  name: string;             // e.g., “Light the candle”
  scriptText?: string;
  durationSec?: number;     // default 30 for SILENCE; optional for others
};

export type Ritual = {
  id: UUID;
  slug: string;             // e.g., 'enochian', 'bloody-mary'
  title: string;
  steps: RitualStep[];      // must be contiguous order = 0..n-1
};

export type Witness = {
  id: UUID;
  alias: string;           // public handle / display
  fullName?: string;       // optional PII for your own UX
  createdAt: ISODateTime;
};

export enum SessionStatus {
  Draft = 'DRAFT',
  InProgress = 'IN_PROGRESS',
  Silence = 'SILENCE',       // exclusively during active silence window
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
}

export type SessionStep = {
  ritualStepId: UUID;
  order: number;
  startedAt?: ISODateTime;
  completedAt?: ISODateTime;
};

export type Recording = {
  id: UUID;
  sessionId: UUID;
  kind: 'AUDIO';
  silenceStepOrder: number;  // which step in the ritual was recorded
  durationSec: number;       // measured actual duration
  sampleRateHz: number;
  channels: number;
  codec: string;             // e.g., 'audio/webm;codecs=opus'
  byteSize: number;          // metadata only (blob lives in storage)
  createdAt: ISODateTime;
};

export type PresenceRating = 0|1|2|3|4|5; // MVP scale 0–5

export type SurveyResponse = {
  id: UUID;
  sessionId: UUID;
  presenceRating: PresenceRating;
  notes?: string;
  createdAt: ISODateTime;
};
