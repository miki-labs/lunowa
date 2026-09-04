import {admitResponsibilityCandidate} from './admission';
import {projectAdmissionReview, projectResponsibility} from './projection';
import {
  EFFECT_OPERATIONS,
  RESOLUTION_REASONS,
  type AdmissionReviewState,
  type EffectOperation,
  type EffectResult,
  type FieldChange,
  type ObligationLeg,
  type ResponsibilityDetails,
  type ResponsibilityEvidenceBasis,
  type ResponsibilityEffectInput,
  type ResponsibilityInterpretationCandidate,
  type ResponsibilityPatch,
  type ResponsibilityState,
  type ResolutionEvidence,
  type ResolutionReason,
  type ReductionResult,
  type TemporalFact
} from './types';

export const RESPONSIBILITY_REDUCER_VERSION = 'responsibility-reducer-v1';

type ReducerOptions = {
  currentEvidenceRevision?: number;
  evidenceBasis?: ResponsibilityEvidenceBasis;
  existingResponsibilities?: readonly ResponsibilityState[];
  now?: Date;
  idFactory?: (candidate: ResponsibilityInterpretationCandidate, effect: ResponsibilityEffectInput, index: number) => string;
};

const clone = <T>(value: T): T => value === undefined ? value : JSON.parse(JSON.stringify(value)) as T;

function deterministicId(candidate: ResponsibilityInterpretationCandidate, effect: ResponsibilityEffectInput, index: number): string {
  const source = `${candidate.userId}|${candidate.connectedAccountId}|${candidate.conversationId}|${candidate.candidateKey}|${effect.effectKey ?? index}`;
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `responsibility-${(hash >>> 0).toString(16).padStart(8, '0')}-${index}`;
}

function iso(now: Date): string {
  return new Date(now.getTime()).toISOString();
}

function detailsFromCandidate(candidate: ResponsibilityInterpretationCandidate): ResponsibilityDetails {
  return {
    completionCriteria: clone(candidate.completionCriteria ?? []),
    constraints: clone(candidate.constraints ?? []),
    pendingProposals: clone(candidate.pendingProposals ?? []),
    agreedFacts: clone(candidate.agreedFacts ?? []),
    uncertainties: clone(candidate.uncertainties ?? []),
    assignmentSemantics: clone(candidate.assignmentSemantics),
    riskDetails: clone(candidate.riskDetails ?? [])
  };
}

function createState(
  candidate: ResponsibilityInterpretationCandidate,
  effect: ResponsibilityEffectInput,
  id: string,
  now: Date
): ResponsibilityState {
  const operationalOutcome = candidate.operationalOutcome?.trim() || effect.patch?.operationalOutcome?.trim();
  if (!operationalOutcome) {
    throw new Error('TRACK CREATE requires a grounded operational outcome');
  }
  const state: ResponsibilityState = {
    userId: candidate.userId,
    connectedAccountId: candidate.connectedAccountId,
    conversationId: candidate.conversationId,
    id,
    operationalOutcome,
    resolutionStatus: 'OPEN',
    liveTrackingState: candidate.liveTrackingState ?? 'TRACKING_ACTIVE',
    attentionMode: candidate.attentionMode ?? 'PRESENT',
    acceptedEvidenceRevision: candidate.evidenceRevision,
    aggregateVersion: 1,
    obligationLegs: clone(candidate.obligationLegs ?? []),
    expectedEvents: clone(candidate.expectedEvents ?? []),
    temporalFacts: clone(candidate.temporalFacts ?? []),
    details: detailsFromCandidate(candidate),
    fieldDecisions: [],
    provenance: clone(candidate.provenance ?? []),
    resolutionHistory: []
  };
  applyPatch(state, effect.patch, candidate.evidenceRevision, now, candidate.semanticTime);
  state.provenance.push(...clone(effect.provenance ?? []));
  if (state.resolutionStatus !== 'OPEN') throw new Error('CREATE cannot insert a resolved Responsibility');
  validateState(state);
  return state;
}

function mergeById<T extends {id: string}>(current: T[], incoming: readonly T[]): T[] {
  const result = current.map(clone);
  const positions = new Map(result.map((item, index) => [item.id, index]));
  for (const item of incoming) {
    const position = positions.get(item.id);
    if (position === undefined) {
      positions.set(item.id, result.length);
      result.push(clone(item));
    } else {
      result[position] = clone(item);
    }
  }
  return result;
}

function fieldsOverlap(left: string, right: string): boolean {
  return left === right ||
    (left === 'temporalFacts' && right.startsWith('temporalFacts.')) ||
    (right === 'temporalFacts' && left.startsWith('temporalFacts.'));
}

function mergeTemporalFacts(current: TemporalFact[], incoming: readonly TemporalFact[], now: Date): TemporalFact[] {
  const result = current.map(clone);
  for (const fact of incoming) {
    const sameId = result.findIndex((item) => item.id === fact.id);
    if (sameId >= 0) {
      const prior = result[sameId];
      if (prior?.originalExpression && fact.originalExpression && prior.originalExpression !== fact.originalExpression) {
        // A correction creates a new derived fact; it never rewrites the
        // source expression attached to the old fact, even if a caller reused
        // its local identifier.
        result[sameId] = {...prior, currentnessStatus: 'SUPERSEDED', supersededAt: iso(now)};
        result.push({...clone(fact), id: `${fact.id}:correction`});
        continue;
      }
      result[sameId] = clone(fact);
      continue;
    }
    const replacement = result.findIndex(
      (item) =>
        item.temporalKind === fact.temporalKind &&
        item.obligationLegId === fact.obligationLegId &&
        item.expectedEventId === fact.expectedEventId &&
        item.currentnessStatus === 'ACCEPTED_CURRENT'
    );
    if (replacement >= 0 && fact.currentnessStatus === 'ACCEPTED_CURRENT') {
      result[replacement] = {
        ...result[replacement],
        currentnessStatus: 'SUPERSEDED',
        supersededAt: iso(now)
      };
    }
    result.push(clone(fact));
  }
  return result;
}

function applyFieldChange(
  state: ResponsibilityState,
  change: FieldChange,
  evidenceRevision: number,
  now: Date
): void {
  const previousDecision = [...state.fieldDecisions].reverse().find((decision) => fieldsOverlap(decision.fieldKey, change.fieldKey));
  if (
    previousDecision &&
    previousDecision.authorityKind === 'USER_CORRECTION' &&
    !['USER_CORRECTION', 'EXTERNAL_AUTHORITATIVE_FACT'].includes(change.authorityKind)
  ) {
    throw new Error(`field ${change.fieldKey} is protected by a user correction until authoritative evidence supersedes it`);
  }
  if (
    previousDecision?.semanticTime &&
    change.semanticTime &&
    Date.parse(previousDecision.semanticTime) > Date.parse(change.semanticTime) &&
    change.relation !== 'CORRECTION' &&
    change.relation !== 'SUPERSEDES' &&
    change.authorityKind !== 'EXTERNAL_AUTHORITATIVE_FACT'
  ) {
    throw new Error(`late evidence for ${change.fieldKey} cannot roll back a semantically newer accepted fact`);
  }
  if (change.semanticTime && Number.isNaN(Date.parse(change.semanticTime))) throw new Error(`invalid semantic time for ${change.fieldKey}`);
  const value = clone(change.value);
  switch (change.fieldKey) {
    case 'operationalOutcome':
      if (typeof value !== 'string' || !value.trim()) throw new Error('operationalOutcome correction must be non-empty');
      state.operationalOutcome = value.trim();
      break;
    case 'liveTrackingState':
      state.liveTrackingState = value as ResponsibilityState['liveTrackingState'];
      break;
    case 'attentionMode':
      state.attentionMode = value as ResponsibilityState['attentionMode'];
      break;
    case 'obligationLegs':
      state.obligationLegs = mergeById(state.obligationLegs, value as ObligationLeg[]);
      break;
    case 'expectedEvents':
      state.expectedEvents = mergeById(state.expectedEvents, value as ResponsibilityState['expectedEvents']);
      break;
    case 'temporalFacts':
    case 'temporalFacts.SOURCE_DUE':
    case 'temporalFacts.EXPECTED_EVENT_TIME':
    case 'temporalFacts.USER_TARGET':
      state.temporalFacts = mergeTemporalFacts(state.temporalFacts, value as TemporalFact[], now);
      break;
    case 'completionCriteria':
      state.details.completionCriteria = mergeById(state.details.completionCriteria, value as ResponsibilityDetails['completionCriteria']);
      break;
    case 'constraints':
      state.details.constraints = mergeById(state.details.constraints, value as ResponsibilityDetails['constraints']);
      break;
    case 'pendingProposals':
      state.details.pendingProposals = mergeById(state.details.pendingProposals, value as ResponsibilityDetails['pendingProposals']);
      break;
    case 'agreedFacts':
      state.details.agreedFacts = mergeById(state.details.agreedFacts, value as ResponsibilityDetails['agreedFacts']);
      break;
    case 'uncertainties':
      // An empty uncertainty list is meaningful: trusted new evidence may
      // resolve an admission/state Review. This field is a current set, while
      // the prior decision and provenance remain in fieldDecisions/history.
      state.details.uncertainties = clone(value as ResponsibilityDetails['uncertainties']);
      break;
    case 'riskDetails':
      state.details.riskDetails = mergeById(state.details.riskDetails, value as ResponsibilityDetails['riskDetails']);
      break;
    default:
      throw new Error(`unsupported field correction: ${String(change.fieldKey)}`);
  }
  state.fieldDecisions.push({
    fieldKey: change.fieldKey,
    value,
    authorityKind: change.authorityKind,
    basisEvidenceRevision: evidenceRevision,
    ...(change.semanticTime ? {semanticTime: change.semanticTime} : {}),
    provenance: clone(change.provenance ?? [])
  });
}

function applyPatch(state: ResponsibilityState, patch: ResponsibilityPatch | undefined, evidenceRevision: number, now: Date, semanticTime?: string): void {
  if (!patch) return;
  const scalarFields = ['operationalOutcome', 'liveTrackingState', 'attentionMode'] as const;
  for (const field of scalarFields) {
    if (patch[field] !== undefined) {
      applyFieldChange(state, {
        fieldKey: field,
        value: patch[field],
        authorityKind: 'INTERPRETATION',
        semanticTime,
        provenance: []
      }, evidenceRevision, now);
    }
  }
  const arrayFields = [
    'obligationLegs',
    'expectedEvents',
    'temporalFacts',
    'completionCriteria',
    'constraints',
    'pendingProposals',
    'agreedFacts',
    'uncertainties',
    'riskDetails'
  ] as const;
  for (const field of arrayFields) {
    const value = patch[field];
    if (value === undefined) continue;
    applyFieldChange(state, {
      fieldKey: field,
      value,
      authorityKind: 'INTERPRETATION',
      semanticTime,
      provenance: []
    }, evidenceRevision, now);
  }
  for (const change of patch.fieldChanges ?? []) applyFieldChange(state, change, evidenceRevision, now);
  state.provenance.push(...clone(patch.fieldChanges?.flatMap((change) => change.provenance ?? []) ?? []));
}

function closeOpenItems(state: ResponsibilityState, now: Date, reason: string): void {
  for (const leg of state.obligationLegs) {
    if (leg.status === 'OPEN') {
      leg.status = 'CLOSED';
      leg.closureReason = reason;
      leg.closedAt = iso(now);
    }
  }
  for (const event of state.expectedEvents) {
    if (event.status === 'PENDING') {
      event.status = 'CLOSED';
      event.closureReason = reason;
      if (reason === 'SATISFIED') event.satisfiedAt = iso(now);
      event.closedAt = iso(now);
    }
  }
  for (const criterion of state.details.completionCriteria) {
    if (criterion.status === 'PENDING') {
      criterion.status = 'SATISFIED';
      criterion.satisfiedAt = iso(now);
    }
  }
}

const strongResolutionKinds = new Set([
  'PROVIDER_RECONCILED_SEND',
  'EXTERNAL_AUTHORITATIVE_FACT',
  'COUNTERPART_EXPLICIT_CLOSURE',
  'EXPLICIT_COMPLETION',
  'ALL_CRITERIA_SATISFIED',
  'USER_OFF_CHANNEL_ASSERTION',
  'USER_ASSERTION'
]);

function assertResolutionEvidence(evidence: ResolutionEvidence | undefined): void {
  if (!evidence || evidence.strength !== 'SUFFICIENT') {
    throw new Error('resolution requires sufficient operational evidence');
  }
  if (!evidence.kinds.some((kind) => strongResolutionKinds.has(kind))) {
    throw new Error('read, silence, acknowledgement, send attempt, or model belief cannot resolve a Responsibility');
  }
}

function hasOpenClosureRequirements(state: ResponsibilityState): boolean {
  return (
    state.obligationLegs.some((leg) => leg.status === 'OPEN') ||
    state.expectedEvents.some((event) => event.status === 'PENDING') ||
    state.details.completionCriteria.some((criterion) => criterion.status === 'PENDING')
  );
}

function resolveState(
  state: ResponsibilityState,
  reason: ResolutionReason,
  evidence: ResolutionEvidence | undefined,
  now: Date
): void {
  if (reason === 'SATISFIED') {
    assertResolutionEvidence(evidence);
    const evidenceClosesOutcome = evidence?.explicitlySatisfiesOutcome || evidence?.kinds.some((kind) =>
      ['EXPLICIT_COMPLETION', 'COUNTERPART_EXPLICIT_CLOSURE', 'USER_OFF_CHANNEL_ASSERTION'].includes(kind)
    );
    if (evidenceClosesOutcome) closeOpenItems(state, now, 'SATISFIED');
    if (hasOpenClosureRequirements(state)) {
      throw new Error('satisfaction evidence does not cover every open obligation, event, or completion criterion');
    }
  } else {
    assertResolutionEvidence(evidence);
    closeOpenItems(state, now, reason);
  }
  state.resolutionHistory.push({reason, at: iso(now), basisEvidenceRevision: state.acceptedEvidenceRevision});
  state.resolutionStatus = 'RESOLVED';
  state.resolutionReason = reason;
  state.resolvedAt = iso(now);
  state.attentionMode = 'PRESENT';
}

function validateTemporalFact(fact: TemporalFact): void {
  if ((fact.obligationLegId && fact.expectedEventId) || !fact.precisionCode.trim()) {
    throw new Error(`invalid temporal fact ${fact.id}`);
  }
  if (fact.valueKind === 'DATE' && (!fact.resolvedDate || fact.resolvedAt)) throw new Error(`DATE temporal fact ${fact.id} has an invalid value shape`);
  if (fact.valueKind === 'INSTANT' && (!fact.resolvedAt || fact.resolvedDate)) throw new Error(`INSTANT temporal fact ${fact.id} has an invalid value shape`);
  if (fact.valueKind === 'UNRESOLVED' && (fact.resolvedAt || fact.resolvedDate)) throw new Error(`UNRESOLVED temporal fact ${fact.id} has a resolved value`);
  if (fact.currentnessStatus === 'SUPERSEDED' && !fact.supersededAt) throw new Error(`superseded temporal fact ${fact.id} needs a timestamp`);
  if (fact.currentnessStatus !== 'SUPERSEDED' && fact.supersededAt) throw new Error(`current temporal fact ${fact.id} cannot have supersededAt`);
}

function validateState(state: ResponsibilityState): void {
  if (!state.operationalOutcome.trim()) throw new Error('operational outcome must be non-empty');
  if (state.resolutionStatus === 'OPEN' && (state.resolutionReason || state.resolvedAt)) throw new Error('open Responsibility cannot have resolution fields');
  if (state.resolutionStatus === 'RESOLVED' && (!state.resolutionReason || !state.resolvedAt)) throw new Error('resolved Responsibility requires reason and time');
  if (state.liveTrackingState === 'HISTORICAL_INACTIVE' && state.attentionMode !== 'PRESENT') throw new Error('historical Responsibility cannot be deferred');
  if (state.attentionMode === 'DEFERRED' && (state.resolutionStatus !== 'OPEN' || state.liveTrackingState !== 'TRACKING_ACTIVE')) throw new Error('only active open Responsibilities can be deferred');
  for (const fact of state.temporalFacts) validateTemporalFact(fact);
}

function candidateEffects(candidate: ResponsibilityInterpretationCandidate): ResponsibilityEffectInput[] {
  if (candidate.effects?.length) return clone(candidate.effects);
  const operation: EffectOperation = candidate.responsibilityRef ? 'UPDATE' : 'CREATE';
  return [{
    operation,
    responsibilityRef: candidate.responsibilityRef,
    effectKey: `${candidate.candidateKey}-0`,
    patch: operation === 'UPDATE'
      ? {
          operationalOutcome: candidate.operationalOutcome,
          liveTrackingState: candidate.liveTrackingState,
          attentionMode: candidate.attentionMode,
          obligationLegs: candidate.obligationLegs,
          expectedEvents: candidate.expectedEvents,
          temporalFacts: candidate.temporalFacts,
          completionCriteria: candidate.completionCriteria,
          constraints: candidate.constraints,
          pendingProposals: candidate.pendingProposals,
          agreedFacts: candidate.agreedFacts,
          uncertainties: candidate.uncertainties,
          riskDetails: candidate.riskDetails
        }
      : undefined,
    resolutionEvidence: candidate.resolutionEvidence,
    provenance: undefined
  }];
}

function reject(candidate: ResponsibilityInterpretationCandidate, reason: string, responsibilities: ResponsibilityState[]): ReductionResult {
  return {status: 'REJECTED', admission: candidate.admission.decision, reason, effects: [], responsibilities};
}

/**
 * Pure admission and reduction boundary. The caller supplies an already
 * normalized/evidence-referenced interpretation candidate; this function does
 * not call a model, inspect message order, or infer identity from similarity.
 */
export function reduceResponsibility(
  candidate: ResponsibilityInterpretationCandidate,
  options: ReducerOptions = {}
): ReductionResult {
  const existing = options.existingResponsibilities?.map(clone) ?? [];
  if (options.currentEvidenceRevision !== undefined && candidate.evidenceRevision !== options.currentEvidenceRevision) {
    return {
      status: 'STALE',
      admission: candidate.admission.decision,
      reason: `candidate basis revision ${candidate.evidenceRevision} is not current revision ${options.currentEvidenceRevision}`,
      effects: [],
      responsibilities: existing
    };
  }

  const admission = admitResponsibilityCandidate(candidate, {evidenceBasis: options.evidenceBasis});
  if (admission.status === 'INVALID_CANDIDATE') return reject(candidate, admission.reason, existing);
  const admittedDecision = admission.decision;

  if (admittedDecision === 'DO_NOT_TRACK') {
    return {status: 'APPLIED', admission: 'DO_NOT_TRACK', effects: [], responsibilities: existing};
  }
  if (admittedDecision === 'NEEDS_REVIEW') {
    const review: AdmissionReviewState = {
      userId: candidate.userId,
      connectedAccountId: candidate.connectedAccountId,
      conversationId: candidate.conversationId,
      id: `admission-review-${candidate.candidateKey}`,
      sourceEventKey: candidate.sourceEventKey,
      candidateKey: candidate.candidateKey,
      evidenceRevision: candidate.evidenceRevision,
      reasonCodes: clone(candidate.admission.reasonCodes),
      candidateSummary: clone(candidate.admission.candidateSummary ?? {}),
      status: 'OPEN'
    };
    return {status: 'APPLIED', admission: 'NEEDS_REVIEW', effects: [], responsibilities: existing, admissionReview: review};
  }

  const effects = candidateEffects(candidate);
  const now = options.now ?? new Date();
  const idFactory = options.idFactory ?? deterministicId;
  const byId = new Map(existing.map((state) => [state.id, state]));
  const seenTargets = new Set<string>();
  const results: EffectResult[] = [];
  try {
    for (const [index, effect] of effects.entries()) {
      if (!EFFECT_OPERATIONS.includes(effect.operation)) throw new Error(`unknown operation ${effect.operation}`);
      const targetId = effect.operation === 'CREATE'
        ? idFactory(candidate, effect, index)
        : effect.responsibilityRef;
      if (effect.operation === 'CREATE' && effect.responsibilityRef) throw new Error('CREATE cannot target an existing Responsibility');
      if (effect.operation !== 'CREATE' && !targetId) throw new Error(`${effect.operation} requires an explicit Responsibility reference`);
      const requiredTargetId = targetId as string;
      if (effect.operation !== 'CREATE' && seenTargets.has(requiredTargetId)) throw new Error('one event cannot apply two effects to the same Responsibility');
      if (effect.operation !== 'CREATE') seenTargets.add(requiredTargetId);

      if (effect.operation === 'CREATE') {
        const state = byId.get(requiredTargetId);
        if (state) {
          if (state.userId !== candidate.userId || state.connectedAccountId !== candidate.connectedAccountId || state.conversationId !== candidate.conversationId) throw new Error('Responsibility identity crosses a tenant or conversation boundary');
          results.push({operation: 'CREATE', responsibilityId: state.id, changed: false, state: clone(state), reason: 'idempotent create already applied', projection: projectResponsibility(state)});
          continue;
        }
        const created = createState(candidate, effect, requiredTargetId, now);
        byId.set(created.id, created);
        results.push({operation: 'CREATE', responsibilityId: created.id, changed: true, state: clone(created), reason: 'new Responsibility admitted', projection: projectResponsibility(created)});
        continue;
      }

      const state = byId.get(requiredTargetId);
      if (!state) throw new Error(`Responsibility ${requiredTargetId} was not found; matching must be explicit`);
      if (state.userId !== candidate.userId || state.connectedAccountId !== candidate.connectedAccountId || state.conversationId !== candidate.conversationId) throw new Error('Responsibility matching cannot cross user, account, or conversation boundaries');
      if (effect.operation === 'NO_OP') {
        results.push({operation: 'NO_OP', responsibilityId: state.id, changed: false, state: clone(state), reason: 'accepted evidence causes no state change', projection: projectResponsibility(state)});
        continue;
      }

      const next = clone(state);
      applyPatch(next, effect.patch, candidate.evidenceRevision, now, candidate.semanticTime);
      next.acceptedEvidenceRevision = candidate.evidenceRevision;
      next.provenance.push(...clone(candidate.provenance ?? []));
      if (effect.provenance?.length) next.provenance.push(...clone(effect.provenance));
      if (effect.operation === 'REOPEN') {
        if (next.resolutionStatus !== 'RESOLVED') throw new Error('REOPEN requires a resolved Responsibility');
        if (
          !effect.resolutionEvidence ||
          effect.resolutionEvidence.strength !== 'SUFFICIENT' ||
          !effect.resolutionEvidence.kinds.some((kind) => ['EXTERNAL_AUTHORITATIVE_FACT', 'PROVIDER_NON_DELIVERY'].includes(kind))
        ) throw new Error('REOPEN requires sufficient contradictory/failure evidence');
        next.resolutionStatus = 'OPEN';
        delete next.resolutionReason;
        delete next.resolvedAt;
      } else if (effect.operation === 'RESOLVE' || effect.operation === 'SUPERSEDE' || effect.operation === 'INVALIDATE') {
        const reason = effect.operation === 'SUPERSEDE'
          ? 'SUPERSEDED'
          : effect.operation === 'INVALIDATE'
            ? 'INVALIDATED'
            : effect.reason as ResolutionReason | undefined;
        if (!reason || !RESOLUTION_REASONS.includes(reason)) throw new Error(`${effect.operation} requires a valid resolution reason`);
        resolveState(next, reason, effect.resolutionEvidence, now);
      }
      next.aggregateVersion = state.aggregateVersion + 1;
      validateState(next);
      byId.set(next.id, next);
      results.push({operation: effect.operation, responsibilityId: next.id, changed: true, state: clone(next), reason: effect.reason ?? `${effect.operation} accepted`, projection: projectResponsibility(next)});
    }
  } catch (error) {
    return reject(candidate, error instanceof Error ? error.message : 'reducer rejected candidate', existing);
  }

  const allResponsibilities = [...byId.values()].map(clone);
  return {status: 'APPLIED', admission: 'TRACK', effects: results, responsibilities: allResponsibilities};
}

export function isMaterialReview(state: ResponsibilityState): boolean {
  return state.details.uncertainties.some((item) => item.material && item.reviewRequired);
}

export {projectAdmissionReview, projectResponsibility};
