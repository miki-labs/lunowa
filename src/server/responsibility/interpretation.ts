import type {
  AdmissionDecision,
  CandidateResponsibilitySemantics,
  EvidenceKind,
  FieldChange,
  ProvenanceInput,
  ResponsibilityEvidenceBasis,
  ResponsibilityInterpretationCandidate,
  ResponsibilityPatch,
  ResponsibilityState,
  ResolutionReason,
  TrustedResponsibilityCommand
} from './types';

const MODEL_FORBIDDEN_EVIDENCE = new Set([
  'PROVIDER_MESSAGE_OBSERVED',
  'PROVIDER_RECONCILED_SEND',
  'PROVIDER_NON_DELIVERY',
  'EXTERNAL_AUTHORITATIVE_FACT',
  'USER_ASSERTION',
  'USER_OFF_CHANNEL_ASSERTION',
  'ALL_CRITERIA_SATISFIED'
]);

const STRONG_COMMUNICATED_COMPLETION = new Set([
  'COUNTERPART_EXPLICIT_CLOSURE',
  'EXPLICIT_COMPLETION'
]);

const CANONICAL_SOURCE_ZONES = new Set([
  'AUTHORED_CURRENT',
  'QUOTED_HISTORY',
  'FORWARDED_CONTENT',
  'SIGNATURE',
  'DISCLAIMER',
  'STRUCTURED_METADATA'
]);

const CURRENT_TURN_AUTHORITY_ZONE = 'AUTHORED_CURRENT';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const FORBIDDEN_AUTHORITY_KEYS = new Set([
  'admission',
  'effects',
  'responsibilityRef',
  'applicationKey',
  'resolutionEvidence',
  'liveTrackingState',
  'attentionMode',
  'providerObservations',
  'operation',
  'commandSource',
  'expectedAggregateVersion'
]);

export type InterpretationDerivationResult =
  | {status: 'DERIVED'; command: TrustedResponsibilityCommand}
  | {status: 'REJECTED'; admission: AdmissionDecision; reason: string};

function clone<T>(value: T): T {
  return value === undefined ? value : JSON.parse(JSON.stringify(value)) as T;
}

function normalizedOutcome(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('und');
}

function referenceKey(item: ProvenanceInput): string | undefined {
  if (item.messageId?.trim()) return `message:${item.messageId.trim()}`;
  if (item.interpretationRunId?.trim()) return `interpretation:${item.interpretationRunId.trim()}`;
  return undefined;
}

function forbiddenAuthorityPath(value: unknown, path = 'candidate'): string | undefined {
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      const found = forbiddenAuthorityPath(item, `${path}[${index}]`);
      if (found) return found;
    }
    return undefined;
  }
  if (!value || typeof value !== 'object') return undefined;
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_AUTHORITY_KEYS.has(key)) return `${path}.${key}`;
    const found = forbiddenAuthorityPath(nested, `${path}.${key}`);
    if (found) return found;
  }
  return undefined;
}

function unitProvenance(unit: CandidateResponsibilitySemantics): ProvenanceInput[] {
  return [
    ...unit.provenance,
    ...(unit.terminalSignal?.provenance ?? []),
    ...(unit.corrections?.flatMap((change) => change.provenance) ?? []),
    ...(unit.obligationLegs?.flatMap((item) => item.provenance) ?? []),
    ...(unit.expectedEvents?.flatMap((item) => item.provenance) ?? []),
    ...(unit.temporalFacts?.flatMap((item) => item.provenance) ?? []),
    ...(unit.completionCriteria?.flatMap((item) => item.provenance) ?? []),
    ...(unit.constraints?.flatMap((item) => item.provenance) ?? []),
    ...(unit.pendingProposals?.flatMap((item) => item.provenance) ?? []),
    ...(unit.agreedFacts?.flatMap((item) => item.provenance) ?? []),
    ...(unit.uncertainties?.flatMap((item) => item.provenance) ?? []),
    ...(unit.riskDetails?.flatMap((item) => item.provenance) ?? [])
  ];
}

function allProvenance(candidate: ResponsibilityInterpretationCandidate): ProvenanceInput[] {
  const result = [...candidate.provenance];
  for (const unit of candidate.semantics) result.push(...unitProvenance(unit));
  result.push(...(candidate.admissionUncertainties?.flatMap((item) => item.provenance) ?? []));
  return result;
}

function validateCandidateShape(candidate: ResponsibilityInterpretationCandidate, basis: ResponsibilityEvidenceBasis): string | undefined {
  const injected = forbiddenAuthorityPath(candidate);
  if (injected) return `interpretation candidate cannot supply trusted authority field ${injected}`;
  if (!candidate.userId || !candidate.connectedAccountId || !candidate.conversationId) return 'tenant scope is required';
  if (!candidate.sourceEventKey?.trim() || !candidate.candidateKey?.trim()) return 'sourceEventKey and candidateKey are required';
  if (!Number.isSafeInteger(candidate.evidenceRevision) || candidate.evidenceRevision < 0) return 'evidenceRevision must be a non-negative integer';
  if (!Array.isArray(candidate.semantics)) return 'semantic units are required';
  if (basis.evidenceRevision !== candidate.evidenceRevision || basis.sourceEventKey !== candidate.sourceEventKey) return 'candidate evidence basis is not current';

  const unitKeys = candidate.semantics.map((unit) => unit.candidateUnitKey?.trim());
  if (unitKeys.some((key) => !key) || new Set(unitKeys).size !== unitKeys.length) return 'candidate semantic unit keys must be non-empty and unique';
  for (const unit of candidate.semantics) {
    if (!['MATERIAL', 'NOT_MATERIAL', 'UNCERTAIN'].includes(unit.materiality)) return `semantic unit ${unit.candidateUnitKey} has invalid materiality`;
    if (unit.identityRelation && !['NEW', 'CONTINUES', 'REPLACES', 'SAME_UNSATISFIED_OUTCOME', 'NEW_EPISODE'].includes(unit.identityRelation.kind)) return `semantic unit ${unit.candidateUnitKey} has invalid identity relation`;
    if (unit.terminalSignal && !['NONE', 'COMPLETED', 'DECLINED', 'CANCELLED', 'INVALIDATED'].includes(unit.terminalSignal.kind)) return `semantic unit ${unit.candidateUnitKey} has invalid terminal signal`;
    if (unit.materiality === 'MATERIAL' && !unit.operationalOutcome?.trim()) return `material unit ${unit.candidateUnitKey} needs an operational outcome`;
    if (unit.operationalOutcome && unit.operationalOutcome.trim().length > 2048) return `semantic unit ${unit.candidateUnitKey} outcome is too long`;
    if (unit.obligationLegs?.some((leg) =>
      !['USER', 'PARTICIPANT', 'OTHER_PARTY', 'EXTERNAL'].includes(leg.bearerCandidate) ||
      !leg.id?.trim() ||
      !leg.actionCode?.trim() ||
      (leg.bearerCandidate !== 'USER' && !UUID.test(leg.participantId ?? ''))
    )) return `semantic unit ${unit.candidateUnitKey} has an invalid obligation candidate`;
    if (unit.expectedEvents?.some((event) =>
      !['PARTICIPANT', 'OTHER_PARTY', 'EXTERNAL'].includes(event.actor) ||
      !event.id?.trim() ||
      !event.eventCode?.trim() ||
      (event.actor !== 'EXTERNAL' && !UUID.test(event.participantId ?? ''))
    )) return `semantic unit ${unit.candidateUnitKey} has an invalid expected-event candidate`;
    const childArrays = [unit.obligationLegs, unit.expectedEvents, unit.temporalFacts, unit.completionCriteria, unit.constraints, unit.pendingProposals, unit.agreedFacts, unit.uncertainties, unit.riskDetails];
    if (childArrays.some((items) => items?.some((item) => item.provenance.length === 0))) return `semantic unit ${unit.candidateUnitKey} has an ungrounded child semantic`;
    if (unit.materiality === 'MATERIAL' && unit.provenance.length === 0) return `material unit ${unit.candidateUnitKey} needs source provenance`;
    if (unit.materiality === 'MATERIAL') {
      const semanticProvenance = unitProvenance(unit);
      const invalidZone = semanticProvenance.find((item) => !CANONICAL_SOURCE_ZONES.has(String(item.sourceLocator?.zone ?? '')));
      if (invalidZone) return `material semantic unit ${unit.candidateUnitKey} needs an explicit canonical source zone`;
      if (!semanticProvenance.some((item) => item.sourceLocator?.zone === CURRENT_TURN_AUTHORITY_ZONE)) {
        return 'quoted, forwarded, boilerplate, or metadata context cannot supply current-turn communicative authority';
      }
    }
    if (unit.identityRelation && unit.identityRelation.kind !== 'NEW' && unit.identityRelation.kind !== 'NEW_EPISODE' && !unit.identityRelation.priorOperationalOutcome?.trim()) {
      return `identity relation ${unit.identityRelation?.kind} needs a prior operational outcome, not a Responsibility identifier`;
    }
  }

  const basisKeys = new Set(basis.references.map(referenceKey).filter((key): key is string => Boolean(key)));
  const provenance = allProvenance(candidate);
  if (provenance.length === 0 || basisKeys.size === 0) return 'candidate needs authorized source provenance';
  for (const item of provenance) {
    if (MODEL_FORBIDDEN_EVIDENCE.has(item.evidenceKind)) return `interpretation candidate cannot assert trusted evidence kind ${item.evidenceKind}`;
    const key = referenceKey(item);
    if (!key || !basisKeys.has(key)) return 'candidate provenance is not contained in the current authorized evidence basis';
  }
  if (candidate.sourceMessageId && !provenance.some((item) => item.messageId === candidate.sourceMessageId)) return 'sourceMessageId must resolve through candidate provenance';
  return undefined;
}

function admissionFor(candidate: ResponsibilityInterpretationCandidate): {decision: AdmissionDecision; reasonCodes: string[]} {
  if (candidate.admissionUncertainties?.some((item) => item.material && item.reviewRequired) || candidate.semantics.some((unit) => unit.materiality === 'UNCERTAIN')) {
    return {decision: 'NEEDS_REVIEW', reasonCodes: ['RESPONSIBILITY_ADMISSION_UNCERTAIN']};
  }
  if (candidate.semantics.some((unit) => unit.materiality === 'MATERIAL')) {
    return {decision: 'TRACK', reasonCodes: ['MATERIAL_OPEN_LOOP_DERIVED']};
  }
  return {decision: 'DO_NOT_TRACK', reasonCodes: ['NO_MATERIAL_OPEN_LOOP_DERIVED']};
}

function findPrior(unit: CandidateResponsibilitySemantics, candidate: ResponsibilityInterpretationCandidate, states: readonly ResponsibilityState[]): ResponsibilityState {
  const priorOutcome = unit.identityRelation?.priorOperationalOutcome;
  if (!priorOutcome) throw new Error('continuation needs a prior operational outcome');
  const matches = states.filter((state) =>
    state.userId === candidate.userId &&
    state.connectedAccountId === candidate.connectedAccountId &&
    state.conversationId === candidate.conversationId &&
    normalizedOutcome(state.operationalOutcome) === normalizedOutcome(priorOutcome)
  );
  if (matches.length !== 1) throw new Error(`identity relation for ${unit.candidateUnitKey} must match exactly one scoped Responsibility`);
  return matches[0] as ResponsibilityState;
}

function patchFor(unit: CandidateResponsibilitySemantics): ResponsibilityPatch {
  const fieldChanges: FieldChange[] = (unit.corrections ?? []).map((change) => ({
    fieldKey: change.relation === 'CONFLICT' ? 'uncertainties' : change.fieldKey,
    value: change.value,
    authorityKind: 'INTERPRETATION',
    ...(change.semanticTime ? {semanticTime: change.semanticTime} : {}),
    relation: change.relation === 'CONFLICT' ? 'NONE' : change.relation,
    provenance: clone(change.provenance)
  }));
  return {
    operationalOutcome: unit.operationalOutcome,
    obligationLegs: unit.obligationLegs?.map(({bearerCandidate, blockedByCondition, ...leg}) => ({
      ...clone(leg), bearer: bearerCandidate, status: 'OPEN',
      actionability: blockedByCondition ? 'BLOCKED' : 'ACTIONABLE',
      ...(blockedByCondition ? {conditionSatisfied: false} : {})
    })),
    expectedEvents: unit.expectedEvents?.map((event) => ({...clone(event), status: 'PENDING'})),
    temporalFacts: unit.temporalFacts?.map(({conflictCandidate, ...fact}) => ({
      ...clone(fact), currentnessStatus: conflictCandidate ? 'CONFLICT_CANDIDATE' : 'ACCEPTED_CURRENT'
    })),
    completionCriteria: unit.completionCriteria?.map((criterion) => ({...clone(criterion), status: 'PENDING'})),
    constraints: unit.constraints?.map((constraint) => ({...clone(constraint), status: 'ACTIVE'})),
    pendingProposals: unit.pendingProposals?.map(({candidateStatus, ...proposal}) => ({...clone(proposal), status: candidateStatus ?? 'PENDING'})),
    agreedFacts: unit.agreedFacts?.map((fact) => ({...clone(fact), status: 'CURRENT'})),
    uncertainties: clone(unit.uncertainties),
    riskDetails: clone(unit.riskDetails),
    fieldChanges
  };
}

function resolutionReason(unit: CandidateResponsibilitySemantics): ResolutionReason | undefined {
  switch (unit.terminalSignal?.kind) {
    case 'COMPLETED': return 'SATISFIED';
    case 'DECLINED': return 'DECLINED';
    case 'CANCELLED': return 'CANCELLED';
    case 'INVALIDATED': return 'INVALIDATED';
    default: return undefined;
  }
}

/** Convert language-level semantics to trusted effects without accepting any model-supplied final authority. */
export function deriveResponsibilityCommand(
  candidate: ResponsibilityInterpretationCandidate,
  input: {evidenceBasis: ResponsibilityEvidenceBasis; existingResponsibilities?: readonly ResponsibilityState[]}
): InterpretationDerivationResult {
  const admission = admissionFor(candidate);
  const shapeError = validateCandidateShape(candidate, input.evidenceBasis);
  if (shapeError) return {status: 'REJECTED', admission: admission.decision, reason: shapeError};

  const command: TrustedResponsibilityCommand = {
    userId: candidate.userId,
    connectedAccountId: candidate.connectedAccountId,
    conversationId: candidate.conversationId,
    sourceEventKey: candidate.sourceEventKey,
    candidateKey: candidate.candidateKey,
    evidenceRevision: candidate.evidenceRevision,
    commandSource: 'INTERPRETATION_BOUNDARY',
    admission: {
      decision: admission.decision,
      reasonCodes: admission.reasonCodes,
      candidateSummary: {
        semanticUnitKeys: candidate.semantics.map((unit) => unit.candidateUnitKey),
        uncertaintyIds: candidate.admissionUncertainties?.map((item) => item.id) ?? []
      }
    },
    provenance: clone(candidate.provenance),
    ...(candidate.interpretationRunId ? {interpretationRunId: candidate.interpretationRunId} : {}),
    ...(candidate.sourceMessageId ? {sourceMessageId: candidate.sourceMessageId} : {}),
    ...(candidate.semanticTime ? {semanticTime: candidate.semanticTime} : {}),
    effects: []
  };

  if (admission.decision !== 'TRACK') return {status: 'DERIVED', command};

  try {
    for (const unit of candidate.semantics.filter((item) => item.materiality === 'MATERIAL')) {
      const relation = unit.identityRelation?.kind ?? 'NEW';
      const patch = patchFor(unit);
      const effectKey = unit.candidateUnitKey;
      if (relation === 'NEW' || relation === 'NEW_EPISODE') {
        command.effects?.push({operation: 'CREATE', effectKey, patch, provenance: clone(unit.provenance)});
        continue;
      }
      const prior = findPrior(unit, candidate, input.existingResponsibilities ?? []);
      if (relation !== 'REPLACES' && normalizedOutcome(unit.operationalOutcome as string) !== normalizedOutcome(prior.operationalOutcome)) {
        throw new Error('continuation cannot rewrite operational identity; use explicit replacement or a field correction');
      }
      if (relation !== 'REPLACES') delete patch.operationalOutcome;
      if (relation === 'REPLACES') {
        const supersessionKinds = unit.provenance.map((item) => item.evidenceKind) as EvidenceKind[];
        if (!supersessionKinds.some((kind) => STRONG_COMMUNICATED_COMPLETION.has(kind))) throw new Error('replacement relation requires grounded explicit supersession/cancellation communication');
        command.effects?.push({
          operation: 'SUPERSEDE', responsibilityRef: prior.id, effectKey: `${effectKey}:supersede`,
          expectedAggregateVersion: prior.aggregateVersion,
          resolutionEvidence: {strength: 'SUFFICIENT', kinds: supersessionKinds}, provenance: clone(unit.provenance)
        });
        command.effects?.push({operation: 'CREATE', effectKey: `${effectKey}:replacement`, patch, provenance: clone(unit.provenance)});
        continue;
      }
      if (relation === 'SAME_UNSATISFIED_OUTCOME') {
        if (prior.resolutionStatus !== 'RESOLVED') throw new Error('SAME_UNSATISFIED_OUTCOME requires a resolved prior Responsibility');
        if (!unit.provenance.some((item) => item.evidenceKind === 'COUNTERPART_FAILURE_REPORT')) throw new Error('reopen relation requires a grounded counterpart failure report');
        command.effects?.push({
          operation: 'REOPEN', responsibilityRef: prior.id, effectKey,
          expectedAggregateVersion: prior.aggregateVersion,
          patch, resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['COUNTERPART_FAILURE_REPORT']}, provenance: clone(unit.provenance)
        });
        continue;
      }
      const reason = resolutionReason(unit);
      if (reason) {
        const evidenceKinds = (unit.terminalSignal?.provenance.map((item) => item.evidenceKind) ?? []) as EvidenceKind[];
        if (!evidenceKinds.some((kind) => STRONG_COMMUNICATED_COMPLETION.has(kind))) {
          throw new Error(`${unit.terminalSignal?.kind} signal lacks sufficient accepted communicative evidence`);
        }
        command.effects?.push({
          operation: reason === 'INVALIDATED' ? 'INVALIDATE' : 'RESOLVE', responsibilityRef: prior.id, effectKey,
          expectedAggregateVersion: prior.aggregateVersion,
          reason, patch, resolutionEvidence: {strength: 'SUFFICIENT', kinds: evidenceKinds}, provenance: clone([...unit.provenance, ...(unit.terminalSignal?.provenance ?? [])])
        });
      } else {
        command.effects?.push({operation: 'UPDATE', responsibilityRef: prior.id, expectedAggregateVersion: prior.aggregateVersion, effectKey, patch, provenance: clone(unit.provenance)});
      }
    }
  } catch (error) {
    return {status: 'REJECTED', admission: admission.decision, reason: error instanceof Error ? error.message : 'interpretation derivation failed'};
  }
  return {status: 'DERIVED', command};
}
