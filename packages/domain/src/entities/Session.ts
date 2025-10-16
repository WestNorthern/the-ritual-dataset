import {
  ISODateTime, Recording, Ritual, RitualStepKind, SessionStatus, SessionStep,
  SurveyResponse, UUID
} from '../types';

export type Session = {
  id: UUID;
  ritualId: UUID;
  witnessIds: UUID[];         // 1..N
  createdBy: UUID;            // creator witness
  status: SessionStatus;
  currentOrder: number;       // index into ritual.steps
  steps: SessionStep[];       // mirrors ritual steps by order
  recording?: Recording;      // exactly one recording per session (on silence step)
  survey?: SurveyResponse;    // MVP: one survey per session
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type SessionFactoryParams = {
  id: UUID;
  ritual: Ritual;
  witnessIds: UUID[];
  createdBy: UUID;
  now: ISODateTime;
};

export function startSession(params: SessionFactoryParams): Session {
  if (!params.witnessIds.length) throw new Error('at least one witness required');
  if (!params.witnessIds.includes(params.createdBy)) throw new Error('createdBy must be a participant');

  const steps: SessionStep[] = params.ritual.steps.map(s => ({
    ritualStepId: s.id,
    order: s.order
  }));

  return {
    id: params.id,
    ritualId: params.ritual.id,
    witnessIds: dedupe(params.witnessIds),
    createdBy: params.createdBy,
    status: SessionStatus.InProgress,
    currentOrder: 0,
    steps,
    createdAt: params.now,
    updatedAt: params.now,
  };
}

export function beginCurrentStep(session: Session, ritual: Ritual, now: ISODateTime): Session {
  guardActive(session);
  const step = getCurrentSessionStep(session);
  if (step.startedAt) return session; // idempotent
  step.startedAt = now;

  const ritualStep = ritual.steps[step.order];
  if (ritualStep.kind === RitualStepKind.Silence) {
    if (session.status !== SessionStatus.InProgress) throw new Error('must be IN_PROGRESS to enter SILENCE');
    session.status = SessionStatus.Silence;
  }

  session.updatedAt = now;
  return session;
}

export function completeCurrentStep(session: Session, ritual: Ritual, now: ISODateTime): Session {
  guardActive(session);
  const step = getCurrentSessionStep(session);
  if (!step.startedAt) throw new Error('step must be started before completing');
  if (step.completedAt) return session; // idempotent

  const ritualStep = ritual.steps[step.order];
  if (ritualStep.kind === RitualStepKind.Silence && session.status !== SessionStatus.Silence) {
    throw new Error('cannot complete SILENCE outside silence state');
  }

  step.completedAt = now;

  // Advance or complete
  if (step.order < session.steps.length - 1) {
    session.currentOrder = step.order + 1;
    session.status = SessionStatus.InProgress; // leave SILENCE if we were in it
  } else {
    session.status = SessionStatus.Completed;
  }

  session.updatedAt = now;
  return session;
}

export function beginSilence(session: Session, ritual: Ritual, now: ISODateTime): Session {
  const cur = getCurrentRitualStep(ritual, session);
  if (cur.kind !== RitualStepKind.Silence) throw new Error('not at SILENCE step');
  return beginCurrentStep(session, ritual, now);
}

export function completeSilenceWithRecording(session: Session, ritual: Ritual, rec: Recording, now: ISODateTime): Session {
  const cur = getCurrentRitualStep(ritual, session);
  if (cur.kind !== RitualStepKind.Silence) throw new Error('not at SILENCE step');
  if (session.status !== SessionStatus.Silence) throw new Error('silence not active');
  if (session.recording) throw new Error('recording already attached');

  session.recording = rec;
  return completeCurrentStep(session, ritual, now);
}

export function submitSurvey(session: Session, survey: SurveyResponse): Session {
  if (session.status !== SessionStatus.Completed) throw new Error('survey allowed only after completion');
  if (session.survey) throw new Error('survey already submitted');
  session.survey = survey;
  return session;
}

// --- helpers
function dedupe(ids: UUID[]): UUID[] {
  return Array.from(new Set(ids));
}
function guardActive(s: Session): void {
  if (s.status === SessionStatus.Completed || s.status === SessionStatus.Cancelled) {
    throw new Error('session not active');
  }
}
function getCurrentSessionStep(s: Session): SessionStep {
  const step = s.steps.find(x => x.order === s.currentOrder);
  if (!step) throw new Error('current step not found');
  return step;
}
function getCurrentRitualStep(ritual: Ritual, s: Session) {
  const rs = ritual.steps.find(x => x.order === s.currentOrder);
  if (!rs) throw new Error('ritual step not found');
  return rs;
}
