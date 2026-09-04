export const ADMISSION_DECISIONS = ['TRACK', 'DO_NOT_TRACK', 'NEEDS_REVIEW'] as const;
export type AdmissionDecision = (typeof ADMISSION_DECISIONS)[number];

export const EFFECT_OPERATIONS = [
  'CREATE',
  'UPDATE',
  'RESOLVE',
  'REOPEN',
  'SUPERSEDE',
  'INVALIDATE',
  'NO_OP'
] as const;
export type EffectOperation = (typeof EFFECT_OPERATIONS)[number];

export const RESOLUTION_REASONS = [
  'SATISFIED',
  'DECLINED',
  'CANCELLED',
  'SUPERSEDED',
  'USER_CLOSED',
  'INVALIDATED',
  'DUPLICATE'
] as const;
export type ResolutionReason = (typeof RESOLUTION_REASONS)[number];

export type ResolutionStatus = 'OPEN' | 'RESOLVED';
export type LiveTrackingState = 'TRACKING_ACTIVE' | 'HISTORICAL_INACTIVE';
export type AttentionMode = 'PRESENT' | 'DEFERRED';
export type ProjectionBucket = 'MY_TURN' | 'WAITING' | 'LATER' | 'DONE' | 'REVIEW' | 'NONE';

export type ResponsibilityScope = {
  userId: string;
  connectedAccountId: string;
  conversationId: string;
};

export type EvidenceKind =
  | 'COMMUNICATED_CLAIM'
  | 'PROVIDER_MESSAGE_OBSERVED'
  | 'PROVIDER_RECONCILED_SEND'
  | 'PROVIDER_NON_DELIVERY'
  | 'EXTERNAL_AUTHORITATIVE_FACT'
  | 'USER_ASSERTION'
  | 'USER_OFF_CHANNEL_ASSERTION'
  | 'COUNTERPART_EXPLICIT_CLOSURE'
  | 'COUNTERPART_FAILURE_REPORT'
  | 'EXPLICIT_COMPLETION'
  | 'ALL_CRITERIA_SATISFIED'
  | 'READ'
  | 'ATTACHMENT_OPENED'
  | 'SILENCE'
  | 'GENERIC_ACKNOWLEDGEMENT'
  | 'SEND_ATTEMPT'
  | 'UNRECONCILED_SEND'
  | 'AI_BELIEF'
  | 'DERIVED_INFERENCE';

export type ProvenanceInput = {
  fieldKey?: string;
  supportRole?: string;
  evidenceKind: EvidenceKind | string;
  messageId?: string;
  providerObservationKey?: string;
  interpretationRunId?: string;
  sourceLocator?: Record<string, unknown>;
  sourceExcerptShort?: string;
};

/**
 * The evidence set a reducer invocation is authorized to use.  A source
 * event key is only an idempotency/trace key; it is deliberately not an
 * evidence reference by itself.
 */
export type ResponsibilityEvidenceBasis = {
  evidenceRevision: number;
  sourceEventKey: string;
  references: readonly ProvenanceInput[];
};

export type ObligationLeg = {
  id: string;
  bearer: 'USER' | 'PARTICIPANT' | 'OTHER_PARTY' | 'EXTERNAL';
  participantId?: string;
  actionCode: string;
  actionSummary?: string;
  objectSummary?: string;
  status: 'OPEN' | 'CLOSED';
  closureReason?: string;
  actionability: 'ACTIONABLE' | 'BLOCKED';
  basisKind: string;
  authorityStatus?: string;
  activationEventId?: string;
  condition?: string;
  conditionSatisfied?: boolean;
  closedAt?: string;
  provenance: ProvenanceInput[];
};

export type ExpectedEvent = {
  id: string;
  actor: 'PARTICIPANT' | 'OTHER_PARTY' | 'EXTERNAL';
  participantId?: string;
  eventCode: string;
  eventSummary?: string;
  status: 'PENDING' | 'CLOSED';
  closureReason?: string;
  basisKind?: string;
  expectationStrength?: string;
  satisfiedAt?: string;
  closedAt?: string;
  provenance: ProvenanceInput[];
};

export type CompletionCriterion = {
  id: string;
  code: string;
  summary?: string;
  status: 'PENDING' | 'SATISFIED' | 'WAIVED';
  satisfiedAt?: string;
  provenance: ProvenanceInput[];
};

export type TemporalFact = {
  id: string;
  temporalKind: 'SOURCE_DUE' | 'EXPECTED_EVENT_TIME' | 'USER_TARGET';
  obligationLegId?: string;
  expectedEventId?: string;
  originalExpression?: string;
  valueKind: 'DATE' | 'INSTANT' | 'UNRESOLVED';
  resolvedDate?: string;
  resolvedAt?: string;
  precisionCode: string;
  referenceTimezone?: string;
  anchorKind?: string;
  anchorReference?: string;
  anchorOffsetSeconds?: number;
  currentnessStatus: 'ACCEPTED_CURRENT' | 'CONFLICT_CANDIDATE' | 'SUPERSEDED' | 'HISTORICAL';
  authorityStatus?: string;
  supersededAt?: string;
  provenance: ProvenanceInput[];
};

export type Constraint = {
  id: string;
  code: string;
  summary?: string;
  status: 'ACTIVE' | 'SATISFIED' | 'CANCELLED' | 'SUPERSEDED';
  conditionRef?: {kind: 'EXPECTED_EVENT' | 'OTHER'; id?: string; code?: string};
  provenance: ProvenanceInput[];
};

export type PendingProposal = {
  id: string;
  kind: string;
  value: unknown;
  status: 'PENDING' | 'REJECTED' | 'SUPERSEDED';
  provenance: ProvenanceInput[];
};

export type AgreedFact = {
  id: string;
  kind: string;
  value: unknown;
  status: 'CURRENT' | 'SUPERSEDED';
  provenance: ProvenanceInput[];
};

export type Uncertainty = {
  id: string;
  fieldKey: string;
  reasonCode: string;
  material: boolean;
  reviewRequired: boolean;
  candidateRefs?: string[];
  provenance: ProvenanceInput[];
};

export type RiskDetail = {
  id: string;
  targetKind: string;
  targetId?: string;
  riskClass: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  reasonCode: string;
  provenance: ProvenanceInput[];
};

export type ResponsibilityDetails = {
  completionCriteria: CompletionCriterion[];
  constraints: Constraint[];
  pendingProposals: PendingProposal[];
  agreedFacts: AgreedFact[];
  uncertainties: Uncertainty[];
  assignmentSemantics?: {
    id: string;
    shape: 'ANY_OF' | 'ALL_OF' | 'UNSPECIFIED_GROUP';
    candidateParticipantIds: string[];
    selectedParticipantId?: string;
  };
  riskDetails: RiskDetail[];
};

export type FieldDecision = {
  fieldKey: string;
  value: unknown;
  authorityKind: string;
  basisEvidenceRevision: number;
  semanticTime?: string;
  provenance: ProvenanceInput[];
};

export type ResponsibilityState = ResponsibilityScope & {
  id: string;
  operationalOutcome: string;
  resolutionStatus: ResolutionStatus;
  resolutionReason?: ResolutionReason;
  liveTrackingState: LiveTrackingState;
  attentionMode: AttentionMode;
  acceptedEvidenceRevision: number;
  aggregateVersion: number;
  resolvedAt?: string;
  obligationLegs: ObligationLeg[];
  expectedEvents: ExpectedEvent[];
  temporalFacts: TemporalFact[];
  details: ResponsibilityDetails;
  fieldDecisions: FieldDecision[];
  provenance: ProvenanceInput[];
  resolutionHistory: Array<{
    reason: ResolutionReason;
    at: string;
    basisEvidenceRevision: number;
  }>;
};

export type ResolutionEvidence = {
  strength: 'SUFFICIENT' | 'WEAK';
  kinds: EvidenceKind[];
  explicitlySatisfiesOutcome?: boolean;
};

export type FieldChange = {
  fieldKey:
    | 'operationalOutcome'
    | 'liveTrackingState'
    | 'attentionMode'
    | 'obligationLegs'
    | 'expectedEvents'
    | 'temporalFacts'
    | 'temporalFacts.SOURCE_DUE'
    | 'temporalFacts.EXPECTED_EVENT_TIME'
    | 'temporalFacts.USER_TARGET'
    | 'completionCriteria'
    | 'constraints'
    | 'pendingProposals'
    | 'agreedFacts'
    | 'uncertainties'
    | 'riskDetails';
  value: unknown;
  authorityKind: string;
  semanticTime?: string;
  relation?: 'NONE' | 'CORRECTION' | 'SUPERSEDES';
  provenance?: ProvenanceInput[];
};

export type ResponsibilityPatch = {
  operationalOutcome?: string;
  liveTrackingState?: LiveTrackingState;
  attentionMode?: AttentionMode;
  obligationLegs?: ObligationLeg[];
  expectedEvents?: ExpectedEvent[];
  temporalFacts?: TemporalFact[];
  completionCriteria?: CompletionCriterion[];
  constraints?: Constraint[];
  pendingProposals?: PendingProposal[];
  agreedFacts?: AgreedFact[];
  uncertainties?: Uncertainty[];
  riskDetails?: RiskDetail[];
  fieldChanges?: FieldChange[];
};

export type ResponsibilityEffectInput = {
  operation: EffectOperation;
  responsibilityRef?: string | null;
  expectedAggregateVersion?: number;
  effectKey?: string;
  reasonCodes?: string[];
  reason?: string;
  patch?: ResponsibilityPatch;
  resolutionEvidence?: ResolutionEvidence;
  provenance?: ProvenanceInput[];
};

/**
 * Structured, but untrusted, interpretation output.  This shape deliberately
 * has no admission decision, domain operation, Responsibility identifier,
 * tracking/defer state, resolution evidence, or provider-observation truth.
 * Those values belong to the trusted boundary below.
 */
export type CandidateIdentityRelation = {
  kind: 'NEW' | 'CONTINUES' | 'REPLACES' | 'SAME_UNSATISFIED_OUTCOME' | 'NEW_EPISODE';
  priorOperationalOutcome?: string;
};

export type CandidateTerminalSignal = {
  kind: 'NONE' | 'COMPLETED' | 'DECLINED' | 'CANCELLED' | 'INVALIDATED';
  provenance: ProvenanceInput[];
};

export type CandidateFieldCorrection = {
  fieldKey: Exclude<FieldChange['fieldKey'], 'liveTrackingState' | 'attentionMode'>;
  value: unknown;
  semanticTime?: string;
  relation: 'CORRECTION' | 'SUPERSEDES' | 'CONFLICT';
  provenance: ProvenanceInput[];
};

export type CandidateObligationLeg = Omit<ObligationLeg, 'bearer' | 'status' | 'closureReason' | 'actionability' | 'conditionSatisfied' | 'closedAt'> & {
  bearerCandidate: ObligationLeg['bearer'];
  blockedByCondition?: boolean;
};

export type CandidateExpectedEvent = Omit<ExpectedEvent, 'status' | 'closureReason' | 'satisfiedAt' | 'closedAt'>;
export type CandidateCompletionCriterion = Omit<CompletionCriterion, 'status' | 'satisfiedAt'>;
export type CandidateConstraint = Omit<Constraint, 'status'>;
export type CandidatePendingProposal = Omit<PendingProposal, 'status'> & {candidateStatus?: 'PENDING' | 'REJECTED'};
export type CandidateAgreedFact = Omit<AgreedFact, 'status'>;
export type CandidateTemporalFact = Omit<TemporalFact, 'currentnessStatus' | 'supersededAt'> & {conflictCandidate?: boolean};

export type CandidateResponsibilitySemantics = {
  candidateUnitKey: string;
  materiality: 'MATERIAL' | 'NOT_MATERIAL' | 'UNCERTAIN';
  operationalOutcome?: string;
  identityRelation?: CandidateIdentityRelation;
  obligationLegs?: CandidateObligationLeg[];
  expectedEvents?: CandidateExpectedEvent[];
  temporalFacts?: CandidateTemporalFact[];
  completionCriteria?: CandidateCompletionCriterion[];
  constraints?: CandidateConstraint[];
  pendingProposals?: CandidatePendingProposal[];
  agreedFacts?: CandidateAgreedFact[];
  uncertainties?: Uncertainty[];
  riskDetails?: RiskDetail[];
  assignmentSemantics?: ResponsibilityDetails['assignmentSemantics'];
  corrections?: CandidateFieldCorrection[];
  terminalSignal?: CandidateTerminalSignal;
  provenance: ProvenanceInput[];
};

export type ResponsibilityInterpretationCandidate = ResponsibilityScope & {
  sourceEventKey: string;
  candidateKey: string;
  evidenceRevision: number;
  semantics: CandidateResponsibilitySemantics[];
  admissionUncertainties?: Uncertainty[];
  provenance: ProvenanceInput[];
  interpretationRunId?: string;
  sourceMessageId?: string;
  semanticTime?: string;
};

/**
 * Effect-bearing input for trusted system/user policy and deterministic tests.
 * It is intentionally a different type from model interpretation output.
 */
export type TrustedResponsibilityCommand = ResponsibilityScope & {
  commandSource: 'INTERPRETATION_BOUNDARY' | 'TRUSTED_SYSTEM' | 'TRUSTED_USER';
  sourceEventKey: string;
  candidateKey: string;
  evidenceRevision: number;
  admission: {
    decision: AdmissionDecision;
    reasonCodes: string[];
    candidateSummary?: Record<string, unknown>;
  };
  operationalOutcome?: string;
  liveTrackingState?: LiveTrackingState;
  attentionMode?: AttentionMode;
  obligationLegs?: ObligationLeg[];
  expectedEvents?: ExpectedEvent[];
  temporalFacts?: TemporalFact[];
  completionCriteria?: CompletionCriterion[];
  constraints?: Constraint[];
  pendingProposals?: PendingProposal[];
  agreedFacts?: AgreedFact[];
  uncertainties?: Uncertainty[];
  riskDetails?: RiskDetail[];
  assignmentSemantics?: ResponsibilityDetails['assignmentSemantics'];
  provenance?: ProvenanceInput[];
  interpretationRunId?: string;
  sourceMessageId?: string;
  semanticTime?: string;
  applicationKey?: string;
  correlationId?: string;
  effects?: ResponsibilityEffectInput[];
  responsibilityRef?: string;
  resolutionEvidence?: ResolutionEvidence;
};

export type AdmissionReviewState = ResponsibilityScope & {
  id: string;
  sourceEventKey: string;
  candidateKey: string;
  evidenceRevision: number;
  reasonCodes: string[];
  candidateSummary: Record<string, unknown>;
  status: 'OPEN' | 'RESOLVED';
  resolution?: 'TRACK' | 'DO_NOT_TRACK';
};

export type Projection = {
  bucket: ProjectionBucket;
  subjectKind: 'RESPONSIBILITY' | 'ADMISSION_REVIEW' | 'NONE';
  primaryReason: string;
};

export type EffectResult = {
  operation: EffectOperation;
  responsibilityId?: string;
  changed: boolean;
  state?: ResponsibilityState;
  reason: string;
  projection?: Projection;
};

export type ReductionResult =
  | {
      status: 'APPLIED';
      admission: AdmissionDecision;
      effects: EffectResult[];
      responsibilities: ResponsibilityState[];
      admissionReview?: AdmissionReviewState;
    }
  | {
      status: 'STALE';
      admission: AdmissionDecision;
      reason: string;
      effects: [];
      responsibilities: ResponsibilityState[];
    }
  | {
      status: 'REJECTED';
      admission: AdmissionDecision;
      reason: string;
      effects: [];
      responsibilities: ResponsibilityState[];
    };
