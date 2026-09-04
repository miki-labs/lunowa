import {
  ADMISSION_DECISIONS,
  type AdmissionDecision,
  type ProvenanceInput,
  type ResponsibilityEvidenceBasis,
  type ResponsibilityInterpretationCandidate
} from './types';

export type AdmissionResult =
  | {status: 'ACCEPTED'; decision: AdmissionDecision; reasonCodes: string[]}
  | {status: 'INVALID_CANDIDATE'; decision: null; reason: string};

export type AdmissionOptions = {
  evidenceBasis?: ResponsibilityEvidenceBasis;
};

const ADMISSION_REVIEW_REASON_CODES = new Set([
  'AMBIGUOUS_ASSIGNMENT',
  'HIGH_RISK_AUTHORITY_AMBIGUOUS',
  'HIGH_RISK_TARGET_AMBIGUOUS',
  'MATERIALITY_AMBIGUOUS',
  'MATERIALITY_UNRESOLVED',
  'MISSING_CONTEXT',
  'NON_LITERAL_READING_CHANGES_OBLIGATION_EXISTENCE',
  'PRAGMATIC_AMBIGUITY',
  'REFERENT_UNRESOLVED',
  'RELATIONSHIP_CONVENTION_UNAVAILABLE',
  'RESPONSIBILITY_ADMISSION_UNCERTAIN',
  'RESPONSIBILITY_EXISTENCE_AMBIGUOUS',
  'SOURCE_AMBIGUITY',
  'UNRESOLVED_DUE_TO_MISSING_CONTEXT',
  'USER_DEPENDENT_MATERIALITY'
]);

const GROUNDING_EVIDENCE_KINDS = new Set([
  'ALL_CRITERIA_SATISFIED',
  'COMMUNICATED_CLAIM',
  'COUNTERPART_EXPLICIT_CLOSURE',
  'EXPLICIT_COMPLETION',
  'EXTERNAL_AUTHORITATIVE_FACT',
  'PROVIDER_MESSAGE_OBSERVED',
  'PROVIDER_NON_DELIVERY',
  'PROVIDER_RECONCILED_SEND',
  'USER_ASSERTION',
  'USER_OFF_CHANNEL_ASSERTION'
]);

function candidateProvenance(candidate: ResponsibilityInterpretationCandidate): ProvenanceInput[] {
  return [
    ...(candidate.provenance ?? []),
    ...(candidate.effects?.flatMap((effect) => [
      ...(effect.provenance ?? []),
      ...(effect.patch?.fieldChanges?.flatMap((change) => change.provenance ?? []) ?? [])
    ]) ?? [])
  ];
}

function authorityReference(provenance: ProvenanceInput): string | undefined {
  const value = provenance.sourceLocator?.authorityReference;
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function evidenceReferenceKey(provenance: ProvenanceInput): string | undefined {
  if (provenance.messageId?.trim()) return `message:${provenance.messageId.trim()}`;
  if (provenance.providerObservationKey?.trim()) return `provider:${provenance.providerObservationKey.trim()}`;
  const reference = authorityReference(provenance);
  return reference ? `authority:${reference}` : undefined;
}

function hasAuthorizedDirectEvidence(provenance: ProvenanceInput): boolean {
  const kind = provenance.evidenceKind;
  return (kind === 'USER_ASSERTION' || kind === 'USER_OFF_CHANNEL_ASSERTION' || kind === 'EXTERNAL_AUTHORITATIVE_FACT') &&
    provenance.sourceLocator?.authorized === true &&
    Boolean(authorityReference(provenance));
}

function validateEvidenceBasis(
  candidate: ResponsibilityInterpretationCandidate,
  basis: ResponsibilityEvidenceBasis | undefined
): string | undefined {
  if (!basis) return 'a current normalized evidence basis is required';
  if (basis.evidenceRevision !== candidate.evidenceRevision) return 'evidence basis revision does not match candidate revision';
  if (basis.sourceEventKey !== candidate.sourceEventKey) return 'evidence basis source event does not match candidate';

  const basisKeys = new Set(basis.references.map(evidenceReferenceKey).filter((key): key is string => Boolean(key)));
  if (basisKeys.size === 0) return 'evidence basis must contain a concrete normalized reference';

  const provenance = candidateProvenance(candidate);
  if (provenance.length === 0) return 'candidate provenance is required; sourceEventKey alone is not evidence';
  if (provenance.some((item) => !evidenceReferenceKey(item))) return 'every provenance entry needs a concrete evidence reference';
  if (provenance.some((item) => !basisKeys.has(evidenceReferenceKey(item) as string))) {
    return 'candidate provenance is not contained in the current evidence basis';
  }
  if (candidate.sourceMessageId && !provenance.some((item) => item.messageId === candidate.sourceMessageId)) {
    return 'sourceMessageId must be preserved in candidate provenance';
  }
  if (!provenance.some((item) => GROUNDING_EVIDENCE_KINDS.has(item.evidenceKind))) {
    return 'AI belief or derived inference cannot be the sole grounding for accepted state';
  }
  if (provenance.some((item) => (item.evidenceKind === 'USER_ASSERTION' || item.evidenceKind === 'USER_OFF_CHANNEL_ASSERTION' || item.evidenceKind === 'EXTERNAL_AUTHORITATIVE_FACT') && !item.messageId && !item.providerObservationKey && !hasAuthorizedDirectEvidence(item))) {
    return 'direct user or external authority evidence must be explicitly authorized';
  }
  return undefined;
}

function hasEffectCommand(candidate: ResponsibilityInterpretationCandidate): boolean {
  return Boolean(candidate.responsibilityRef || candidate.effects?.length);
}

function hasMaterialOpenLoop(candidate: ResponsibilityInterpretationCandidate): boolean {
  if (hasEffectCommand(candidate)) return true;
  if (candidate.operationalOutcome?.trim()) return true;
  return Boolean(
    candidate.obligationLegs?.length ||
    candidate.expectedEvents?.length ||
    candidate.completionCriteria?.length ||
    candidate.pendingProposals?.length ||
    candidate.agreedFacts?.length
  );
}

function deterministicDecision(candidate: ResponsibilityInterpretationCandidate): AdmissionDecision {
  // Admission ambiguity is a pre-Responsibility condition.  Candidate
  // fields may be retained as review context, but cannot cause a fake state
  // to be created.  A command/effect targeting an existing state is already
  // an admitted TRACK operation and cannot be relabelled as admission Review.
  if (!hasEffectCommand(candidate) && candidate.admission.reasonCodes.some((code) => ADMISSION_REVIEW_REASON_CODES.has(code))) {
    return 'NEEDS_REVIEW';
  }
  return hasMaterialOpenLoop(candidate) ? 'TRACK' : 'DO_NOT_TRACK';
}

export function validateResponsibilityCandidateEvidence(
  candidate: ResponsibilityInterpretationCandidate,
  basis?: ResponsibilityEvidenceBasis
): string | undefined {
  return validateEvidenceBasis(candidate, basis);
}

export function determineResponsibilityAdmission(candidate: ResponsibilityInterpretationCandidate): AdmissionDecision {
  return deterministicDecision(candidate);
}

/**
 * Admission is a small deterministic gate. It does not turn risk labels,
 * confidence, unread state, or the presence of a request into a review. The
 * interpretation candidate must carry semantic facts and evidence references;
 * this gate derives the accepted decision and the reducer applies it.
 */
export function admitResponsibilityCandidate(
  candidate: ResponsibilityInterpretationCandidate,
  options: AdmissionOptions = {}
): AdmissionResult {
  if (!candidate.userId || !candidate.connectedAccountId || !candidate.conversationId) {
    return {status: 'INVALID_CANDIDATE', decision: null, reason: 'tenant scope is required'};
  }
  if (!candidate.sourceEventKey.trim() || !candidate.candidateKey.trim()) {
    return {status: 'INVALID_CANDIDATE', decision: null, reason: 'sourceEventKey and candidateKey are required'};
  }
  if (!Number.isSafeInteger(candidate.evidenceRevision) || candidate.evidenceRevision < 0) {
    return {status: 'INVALID_CANDIDATE', decision: null, reason: 'evidenceRevision must be a non-negative integer'};
  }
  if (!ADMISSION_DECISIONS.includes(candidate.admission.decision)) {
    return {status: 'INVALID_CANDIDATE', decision: null, reason: 'unknown admission decision'};
  }
  if (candidate.admission.reasonCodes.length === 0) {
    return {status: 'INVALID_CANDIDATE', decision: null, reason: 'admission requires at least one reason code'};
  }
  const evidenceError = validateEvidenceBasis(candidate, options.evidenceBasis);
  if (evidenceError) return {status: 'INVALID_CANDIDATE', decision: null, reason: evidenceError};
  const decision = deterministicDecision(candidate);
  if (candidate.admission.decision !== decision) {
    return {
      status: 'INVALID_CANDIDATE',
      decision: null,
      reason: `candidate admission ${candidate.admission.decision} disagrees with deterministic admission ${decision}`
    };
  }
  if (decision === 'NEEDS_REVIEW' && candidate.effects?.length) {
    return {status: 'INVALID_CANDIDATE', decision: null, reason: 'admission Review cannot carry domain effects'};
  }
  return {
    status: 'ACCEPTED',
    decision,
    reasonCodes: [...candidate.admission.reasonCodes]
  };
}

export const admitCandidate = admitResponsibilityCandidate;
