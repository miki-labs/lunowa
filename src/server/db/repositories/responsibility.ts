import {and, asc, eq, inArray, sql} from 'drizzle-orm';
import {createHash} from 'node:crypto';

import {getDatabase} from '../index';
import {attachments, conversations, messages, participantIdentities} from '../schema/evidence';
import {
  aiInterpretationRuns,
  responsibilities,
  responsibilityAdmissionReviews,
  responsibilityDomainEvents,
  responsibilityExpectedEvents,
  responsibilityFieldDecisions,
  responsibilityObligationLegs,
  responsibilityProvenanceRefs,
  responsibilityTemporalFacts
} from '../schema/responsibility';
import type {ResponsibilitySemanticDetailsV1} from '../schema/responsibility';
import {
  admitTrustedResponsibilityCommand,
  deriveResponsibilityCommand,
  projectResponsibility,
  reduceResponsibility,
  RESPONSIBILITY_REDUCER_VERSION
} from '../../responsibility';
import type {
  AdmissionDecision,
  AdmissionReviewState,
  ObligationLeg,
  ProvenanceInput,
  ResponsibilityDetails,
  ResponsibilityEvidenceBasis,
  ResponsibilityEffectInput,
  ResponsibilityInterpretationCandidate,
  ResponsibilityState,
  TemporalFact,
  ReductionResult,
  TrustedResponsibilityCommand
} from '../../responsibility';

type Database = ReturnType<typeof getDatabase>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string | undefined): value is string {
  return Boolean(value && UUID.test(value));
}

/** Stable IDs make retry behavior deterministic without allowing a candidate
 * to choose a row belonging to another tenant. */
function stableUuid(seed: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  let h3 = 0x9e3779b9;
  let h4 = 0x85ebca6b;
  for (let index = 0; index < seed.length; index += 1) {
    const code = seed.charCodeAt(index);
    h1 = Math.imul(h1 ^ code, 16777619);
    h2 = Math.imul(h2 ^ code, 2246822519);
    h3 = Math.imul(h3 ^ code, 3266489917);
    h4 = Math.imul(h4 ^ code, 668265263);
  }
  const hex = [h1, h2, h3, h4]
    .map((part) => (part >>> 0).toString(16).padStart(8, '0'))
    .join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function scopedMachineKey(kind: 'app' | 'fx', parts: readonly string[]): string {
  const hash = createHash('sha256');
  for (const part of parts) hash.update(`${Buffer.byteLength(part, 'utf8')}:`).update(part);
  return `${kind}:${hash.digest('hex')}`;
}

function nullableUuid(value: string | undefined): string | null {
  return isUuid(value) ? value : null;
}

function nullableText(value: string | undefined): string | null {
  return value ?? null;
}

function effectsFor(candidate: TrustedResponsibilityCommand): ResponsibilityEffectInput[] {
  return candidate.effects?.length
    ? candidate.effects
    : [{
        operation: candidate.responsibilityRef ? 'UPDATE' : 'CREATE',
        responsibilityRef: candidate.responsibilityRef,
        effectKey: `${candidate.candidateKey}-0`,
        patch: candidate.responsibilityRef ? {
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
        } : undefined,
        resolutionEvidence: candidate.resolutionEvidence,
        provenance: undefined
      }];
}

function effectKey(effect: ResponsibilityEffectInput, candidate: TrustedResponsibilityCommand, index: number): string {
  return effect.effectKey?.trim() || `${candidate.candidateKey}-${index}`;
}

function stateFromRow(
  row: typeof responsibilities.$inferSelect,
  legs: readonly typeof responsibilityObligationLegs.$inferSelect[],
  events: readonly typeof responsibilityExpectedEvents.$inferSelect[],
  temporalFacts: readonly typeof responsibilityTemporalFacts.$inferSelect[],
  fieldDecisions: readonly typeof responsibilityFieldDecisions.$inferSelect[],
  domainEvents: readonly typeof responsibilityDomainEvents.$inferSelect[],
  provenanceRefs: readonly typeof responsibilityProvenanceRefs.$inferSelect[]
): ResponsibilityState {
  const rawDetails = (row.semanticDetails ?? {}) as Partial<ResponsibilityDetails>;
  const provenanceInput = (reference: typeof responsibilityProvenanceRefs.$inferSelect): ProvenanceInput => ({
    ...(reference.fieldKey ? {fieldKey: reference.fieldKey} : {}),
    ...(reference.supportRole ? {supportRole: reference.supportRole} : {}),
    evidenceKind: reference.evidenceKind,
    ...(reference.messageId ? {messageId: reference.messageId} : {}),
    ...(reference.providerObservationKey ? {providerObservationKey: reference.providerObservationKey} : {}),
    ...(reference.interpretationRunId ? {interpretationRunId: reference.interpretationRunId} : {}),
    ...(reference.sourceLocator ? {sourceLocator: reference.sourceLocator} : {}),
    ...(reference.sourceExcerptShort ? {sourceExcerptShort: reference.sourceExcerptShort} : {})
  });
  const provenanceFor = (targetKind: string, targetId?: string, fieldKey?: string): ProvenanceInput[] => provenanceRefs
    .filter((reference) => reference.targetKind === targetKind &&
      (targetId === undefined || reference.targetId === targetId) &&
      (fieldKey === undefined || reference.fieldKey === fieldKey))
    .map(provenanceInput);
  return {
    id: row.id,
    userId: row.userId,
    connectedAccountId: row.connectedAccountId,
    conversationId: row.conversationId,
    operationalOutcome: row.operationalOutcome,
    resolutionStatus: row.resolutionStatus as ResponsibilityState['resolutionStatus'],
    ...(row.resolutionReason ? {resolutionReason: row.resolutionReason as ResponsibilityState['resolutionReason']} : {}),
    liveTrackingState: row.liveTrackingState as ResponsibilityState['liveTrackingState'],
    attentionMode: row.attentionMode as ResponsibilityState['attentionMode'],
    acceptedEvidenceRevision: row.acceptedEvidenceRevision,
    aggregateVersion: row.aggregateVersion,
    ...(row.resolvedAt ? {resolvedAt: row.resolvedAt.toISOString()} : {}),
    obligationLegs: legs.map((leg) => ({
      id: leg.id,
      bearer: leg.bearerKind === 'USER' ? 'USER' : 'PARTICIPANT',
      ...(leg.bearerParticipantId ? {participantId: leg.bearerParticipantId} : {}),
      actionCode: leg.actionCode,
      ...(leg.actionSummary ? {actionSummary: leg.actionSummary} : {}),
      ...(leg.objectSummary ? {objectSummary: leg.objectSummary} : {}),
      status: leg.legStatus as ObligationLeg['status'],
      ...(leg.closureReason ? {closureReason: leg.closureReason} : {}),
      actionability: leg.actionability as ObligationLeg['actionability'],
      basisKind: leg.basisKind,
      ...(leg.authorityStatus ? {authorityStatus: leg.authorityStatus} : {}),
      ...(leg.activationEventId ? {activationEventId: leg.activationEventId} : {}),
      ...(leg.closedAt ? {closedAt: leg.closedAt.toISOString()} : {}),
      provenance: provenanceFor('OBLIGATION_LEG', leg.id)
    })),
    expectedEvents: events.map((event) => ({
      id: event.id,
      actor: event.actorKind === 'EXTERNAL' ? 'EXTERNAL' : 'PARTICIPANT',
      ...(event.actorParticipantId ? {participantId: event.actorParticipantId} : {}),
      eventCode: event.eventCode,
      ...(event.eventSummary ? {eventSummary: event.eventSummary} : {}),
      status: event.eventStatus as 'PENDING' | 'CLOSED',
      ...(event.closureReason ? {closureReason: event.closureReason} : {}),
      ...(event.basisKind ? {basisKind: event.basisKind} : {}),
      ...(event.expectationStrength ? {expectationStrength: event.expectationStrength} : {}),
      ...(event.satisfiedAt ? {satisfiedAt: event.satisfiedAt.toISOString()} : {}),
      ...(event.closedAt ? {closedAt: event.closedAt.toISOString()} : {}),
      provenance: provenanceFor('EXPECTED_EVENT', event.id)
    })),
    temporalFacts: temporalFacts.map((fact) => ({
      id: fact.id,
      temporalKind: fact.temporalKind as TemporalFact['temporalKind'],
      ...(fact.obligationLegId ? {obligationLegId: fact.obligationLegId} : {}),
      ...(fact.expectedEventId ? {expectedEventId: fact.expectedEventId} : {}),
      ...(fact.originalExpression ? {originalExpression: fact.originalExpression} : {}),
      valueKind: fact.valueKind as TemporalFact['valueKind'],
      ...(fact.resolvedDate ? {resolvedDate: fact.resolvedDate} : {}),
      ...(fact.resolvedAt ? {resolvedAt: fact.resolvedAt.toISOString()} : {}),
      precisionCode: fact.precisionCode,
      ...(fact.referenceTimezone ? {referenceTimezone: fact.referenceTimezone} : {}),
      ...(fact.anchorKind ? {anchorKind: fact.anchorKind} : {}),
      ...(fact.anchorReference ? {anchorReference: fact.anchorReference} : {}),
      ...(fact.anchorOffsetSeconds !== null ? {anchorOffsetSeconds: fact.anchorOffsetSeconds ?? undefined} : {}),
      currentnessStatus: fact.currentnessStatus as TemporalFact['currentnessStatus'],
      ...(fact.authorityStatus ? {authorityStatus: fact.authorityStatus} : {}),
      ...(fact.supersededAt ? {supersededAt: fact.supersededAt.toISOString()} : {}),
      provenance: provenanceFor('TEMPORAL_FACT', fact.id)
    })),
    details: {
      completionCriteria: (rawDetails.completionCriteria ?? []).map((item) => ({...item, provenance: provenanceFor('COMPLETION_CRITERION', undefined, `completionCriteria/${item.id}`)})),
      constraints: (rawDetails.constraints ?? []).map((item) => ({...item, provenance: provenanceFor('CONSTRAINT', undefined, `constraints/${item.id}`)})),
      pendingProposals: (rawDetails.pendingProposals ?? []).map((item) => ({...item, provenance: provenanceFor('PENDING_PROPOSAL', undefined, `pendingProposals/${item.id}`)})),
      agreedFacts: (rawDetails.agreedFacts ?? []).map((item) => ({...item, provenance: provenanceFor('AGREED_FACT', undefined, `agreedFacts/${item.id}`)})),
      uncertainties: (rawDetails.uncertainties ?? []).map((item) => ({...item, provenance: provenanceFor('UNCERTAINTY', undefined, `uncertainties/${item.id}`)})),
      assignmentSemantics: rawDetails.assignmentSemantics,
      riskDetails: (rawDetails.riskDetails ?? []).map((item) => ({...item, provenance: provenanceFor('RISK_DETAIL', undefined, `riskDetails/${item.id}`)}))
    },
    fieldDecisions: fieldDecisions.map((decision) => ({
      fieldKey: decision.fieldKey,
      value: (typeof decision.valueJsonb === 'object' && decision.valueJsonb !== null && (decision.valueJsonb as {__lunowaFieldDecision?: unknown}).__lunowaFieldDecision === true)
        ? (decision.valueJsonb as {value: unknown}).value
        : decision.valueJsonb,
      authorityKind: decision.authorityKind,
      basisEvidenceRevision: decision.basisEvidenceRevision,
      ...(typeof decision.valueJsonb === 'object' && decision.valueJsonb !== null && (decision.valueJsonb as {__lunowaFieldDecision?: unknown}).__lunowaFieldDecision === true && typeof (decision.valueJsonb as {semanticTime?: unknown}).semanticTime === 'string'
        ? {semanticTime: (decision.valueJsonb as {semanticTime: string}).semanticTime}
        : {}),
      provenance: provenanceFor('FIELD_DECISION', decision.id, decision.fieldKey)
    })),
    provenance: provenanceFor('RESPONSIBILITY'),
    resolutionHistory: domainEvents
      .filter((event) => ['RESOLVE', 'SUPERSEDE', 'INVALIDATE'].includes(event.operation))
      .map((event) => ({
        reason: (event.operation === 'SUPERSEDE' ? 'SUPERSEDED' : event.operation === 'INVALIDATE' ? 'INVALIDATED' : (event.changeSummary.reason as ResponsibilityState['resolutionReason'])) as NonNullable<ResponsibilityState['resolutionReason']>,
        at: event.occurredAt.toISOString(),
        basisEvidenceRevision: event.basisEvidenceRevision
      }))
  };
}

async function loadState(tx: Parameters<Parameters<Database['transaction']>[0]>[0], responsibilityId: string, lock = true): Promise<ResponsibilityState | undefined> {
  const query = tx.select().from(responsibilities).where(eq(responsibilities.id, responsibilityId));
  const rows = lock ? await query.for('update') : await query;
  const row = rows[0];
  if (!row) return undefined;
  const [legs, events, temporalFacts, fieldDecisions, domainEvents, provenanceRefs] = await Promise.all([
    tx.select().from(responsibilityObligationLegs).where(eq(responsibilityObligationLegs.responsibilityId, responsibilityId)).orderBy(asc(responsibilityObligationLegs.createdAt), asc(responsibilityObligationLegs.id)),
    tx.select().from(responsibilityExpectedEvents).where(eq(responsibilityExpectedEvents.responsibilityId, responsibilityId)).orderBy(asc(responsibilityExpectedEvents.createdAt), asc(responsibilityExpectedEvents.id)),
    tx.select().from(responsibilityTemporalFacts).where(eq(responsibilityTemporalFacts.responsibilityId, responsibilityId)).orderBy(asc(responsibilityTemporalFacts.createdAt), asc(responsibilityTemporalFacts.id)),
    tx.select().from(responsibilityFieldDecisions).where(eq(responsibilityFieldDecisions.responsibilityId, responsibilityId)).orderBy(asc(responsibilityFieldDecisions.createdAt), asc(responsibilityFieldDecisions.id)),
    tx.select().from(responsibilityDomainEvents).where(eq(responsibilityDomainEvents.responsibilityId, responsibilityId)).orderBy(asc(responsibilityDomainEvents.occurredAt), asc(responsibilityDomainEvents.id)),
    tx.select().from(responsibilityProvenanceRefs).where(eq(responsibilityProvenanceRefs.responsibilityId, responsibilityId)).orderBy(asc(responsibilityProvenanceRefs.createdAt), asc(responsibilityProvenanceRefs.id))
  ]);
  return stateFromRow(row, legs, events, temporalFacts, fieldDecisions, domainEvents, provenanceRefs);
}

function persistedStateIds(state: ResponsibilityState): ResponsibilityState {
  const legIds = new Map(state.obligationLegs.map((leg) => [leg.id, isUuid(leg.id) ? leg.id : stableUuid(`${state.id}:leg:${leg.id}`)]));
  const eventIds = new Map(state.expectedEvents.map((event) => [event.id, isUuid(event.id) ? event.id : stableUuid(`${state.id}:event:${event.id}`)]));
  const result: ResponsibilityState = {
    ...state,
    obligationLegs: state.obligationLegs.map((leg) => ({
      ...leg,
      id: legIds.get(leg.id) as string,
      ...(leg.activationEventId ? {activationEventId: eventIds.get(leg.activationEventId) ?? nullableUuid(leg.activationEventId) ?? undefined} : {})
    })),
    expectedEvents: state.expectedEvents.map((event) => ({
      ...event,
      id: eventIds.get(event.id) as string
    })),
    temporalFacts: state.temporalFacts.map((fact) => ({
      ...fact,
      id: isUuid(fact.id) ? fact.id : stableUuid(`${state.id}:temporal:${fact.id}`),
      ...(fact.obligationLegId ? {obligationLegId: legIds.get(fact.obligationLegId) ?? nullableUuid(fact.obligationLegId) ?? undefined} : {}),
      ...(fact.expectedEventId ? {expectedEventId: eventIds.get(fact.expectedEventId) ?? nullableUuid(fact.expectedEventId) ?? undefined} : {})
    })),
    details: {
      ...state.details,
      constraints: state.details.constraints.map((item) => ({
        ...item,
        ...(item.conditionRef?.id ? {conditionRef: {...item.conditionRef, id: eventIds.get(item.conditionRef.id) ?? item.conditionRef.id}} : {})
      }))
    }
  };
  return result;
}

function stripProvenance<T extends {provenance?: unknown}>(item: T): Omit<T, 'provenance'> {
  const {provenance, ...rest} = item;
  void provenance;
  return rest;
}

function detailsForDatabase(details: ResponsibilityDetails): ResponsibilitySemanticDetailsV1 {
  return {
    completionCriteria: details.completionCriteria.map(stripProvenance),
    constraints: details.constraints.map(stripProvenance),
    pendingProposals: details.pendingProposals.map(stripProvenance),
    agreedFacts: details.agreedFacts.map(stripProvenance),
    uncertainties: details.uncertainties.map(stripProvenance),
    assignmentSemantics: details.assignmentSemantics,
    riskDetails: details.riskDetails.map(stripProvenance)
  };
}

function safeSourceLocator(provenance: {sourceLocator?: Record<string, unknown>}): Record<string, unknown> {
  return provenance.sourceLocator ?? {};
}

function canReferenceMessage(value: string | undefined): string | null {
  return isUuid(value) ? value : null;
}

function candidateProvenance(candidate: TrustedResponsibilityCommand): ProvenanceInput[] {
  const patchProvenance = (patch: ResponsibilityEffectInput['patch']): ProvenanceInput[] => patch ? [
    ...(patch.obligationLegs?.flatMap((item) => item.provenance) ?? []),
    ...(patch.expectedEvents?.flatMap((item) => item.provenance) ?? []),
    ...(patch.temporalFacts?.flatMap((item) => item.provenance) ?? []),
    ...(patch.completionCriteria?.flatMap((item) => item.provenance) ?? []),
    ...(patch.constraints?.flatMap((item) => item.provenance) ?? []),
    ...(patch.pendingProposals?.flatMap((item) => item.provenance) ?? []),
    ...(patch.agreedFacts?.flatMap((item) => item.provenance) ?? []),
    ...(patch.uncertainties?.flatMap((item) => item.provenance) ?? []),
    ...(patch.riskDetails?.flatMap((item) => item.provenance) ?? []),
    ...(patch.fieldChanges?.flatMap((change) => change.provenance ?? []) ?? [])
  ] : [];
  return [
    ...(candidate.provenance ?? []),
    ...(candidate.obligationLegs?.flatMap((item) => item.provenance) ?? []),
    ...(candidate.expectedEvents?.flatMap((item) => item.provenance) ?? []),
    ...(candidate.temporalFacts?.flatMap((item) => item.provenance) ?? []),
    ...(candidate.completionCriteria?.flatMap((item) => item.provenance) ?? []),
    ...(candidate.constraints?.flatMap((item) => item.provenance) ?? []),
    ...(candidate.pendingProposals?.flatMap((item) => item.provenance) ?? []),
    ...(candidate.agreedFacts?.flatMap((item) => item.provenance) ?? []),
    ...(candidate.uncertainties?.flatMap((item) => item.provenance) ?? []),
    ...(candidate.riskDetails?.flatMap((item) => item.provenance) ?? []),
    ...(candidate.effects?.flatMap((effect) => [
      ...(effect.provenance ?? []),
      ...patchProvenance(effect.patch)
    ]) ?? [])
  ];
}

function commandChildrenAreGrounded(candidate: TrustedResponsibilityCommand): boolean {
  const arrays = [
    candidate.obligationLegs, candidate.expectedEvents, candidate.temporalFacts,
    candidate.completionCriteria, candidate.constraints, candidate.pendingProposals,
    candidate.agreedFacts, candidate.uncertainties, candidate.riskDetails,
    ...(candidate.effects?.flatMap((effect) => [
      effect.patch?.obligationLegs, effect.patch?.expectedEvents, effect.patch?.temporalFacts,
      effect.patch?.completionCriteria, effect.patch?.constraints, effect.patch?.pendingProposals,
      effect.patch?.agreedFacts, effect.patch?.uncertainties, effect.patch?.riskDetails
    ]) ?? [])
  ];
  if (arrays.some((items) => items?.some((item) => item.provenance.length === 0))) return false;
  return !(candidate.effects?.some((effect) => effect.patch?.fieldChanges?.some((change) => !change.provenance?.length)) ?? false);
}

function commandAuthorityIsConsistent(candidate: TrustedResponsibilityCommand): boolean {
  const changes = candidate.effects?.flatMap((effect) => effect.patch?.fieldChanges ?? []) ?? [];
  if (changes.some((change) => change.authorityKind === 'USER_CORRECTION') && candidate.commandSource !== 'TRUSTED_USER') return false;
  if (changes.some((change) => change.authorityKind === 'EXTERNAL_AUTHORITATIVE_FACT') && candidate.commandSource !== 'TRUSTED_SYSTEM') return false;
  const evidenceKinds = [
    ...(candidate.resolutionEvidence?.kinds ?? []),
    ...(candidate.effects?.flatMap((effect) => effect.resolutionEvidence?.kinds ?? []) ?? [])
  ];
  if (evidenceKinds.some((kind) => kind === 'USER_ASSERTION' || kind === 'USER_OFF_CHANNEL_ASSERTION') && candidate.commandSource !== 'TRUSTED_USER') return false;
  if (evidenceKinds.some((kind) => kind.startsWith('PROVIDER_')) && candidate.commandSource !== 'TRUSTED_SYSTEM') return false;
  return true;
}

function interpretationProvenance(candidate: ResponsibilityInterpretationCandidate): ProvenanceInput[] {
  return [
    ...candidate.provenance,
    ...candidate.semantics.flatMap((unit) => [
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
    ]),
    ...(candidate.admissionUncertainties?.flatMap((item) => item.provenance) ?? [])
  ];
}

function explicitAuthorityReference(provenance: ProvenanceInput): string | undefined {
  const value = provenance.sourceLocator?.authorityReference;
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function isAuthorizedDirectEvidence(provenance: ProvenanceInput): boolean {
  return (
    provenance.evidenceKind === 'USER_ASSERTION' ||
    provenance.evidenceKind === 'USER_OFF_CHANNEL_ASSERTION' ||
    provenance.evidenceKind === 'EXTERNAL_AUTHORITATIVE_FACT'
  ) && provenance.sourceLocator?.authorized === true && Boolean(explicitAuthorityReference(provenance));
}

/**
 * Resolve candidate pointers against the already-persisted normalized
 * evidence. A sourceEventKey is intentionally not sufficient: it is a
 * caller/idempotency label, not a provider observation.
 */
async function evidenceBasisForCandidate(
  tx: Parameters<Parameters<Database['transaction']>[0]>[0],
  candidate: TrustedResponsibilityCommand
): Promise<ResponsibilityEvidenceBasis | undefined> {
  if (!commandChildrenAreGrounded(candidate) || !commandAuthorityIsConsistent(candidate)) return undefined;
  const provenance = candidateProvenance(candidate);
  const messageIds = [...new Set(
    provenance
      .map((item) => item.messageId)
      .filter((value): value is string => Boolean(value))
  )];
  const directReferences = provenance.filter((item) => isAuthorizedDirectEvidence(item) && (
    ((item.evidenceKind === 'USER_ASSERTION' || item.evidenceKind === 'USER_OFF_CHANNEL_ASSERTION') && candidate.commandSource === 'TRUSTED_USER') ||
    (item.evidenceKind === 'EXTERNAL_AUTHORITATIVE_FACT' && candidate.commandSource === 'TRUSTED_SYSTEM')
  ));
  const providerReferences = provenance.filter((item) =>
    candidate.commandSource === 'TRUSTED_SYSTEM' &&
    (item.evidenceKind === 'PROVIDER_NON_DELIVERY' || item.evidenceKind === 'EXTERNAL_AUTHORITATIVE_FACT') &&
    Boolean(item.providerObservationKey) &&
    item.sourceLocator?.authorized === true &&
    Boolean(explicitAuthorityReference(item))
  );
  const references: ProvenanceInput[] = [...directReferences, ...providerReferences];

  if (messageIds.length > 0) {
    if (messageIds.some((id) => !isUuid(id))) return undefined;
    const rows = await tx
      .select({id: messages.id, direction: messages.direction})
      .from(messages)
      .where(and(
        eq(messages.userId, candidate.userId),
        eq(messages.connectedAccountId, candidate.connectedAccountId),
        eq(messages.conversationId, candidate.conversationId),
        inArray(messages.id, messageIds)
      ));
    if (rows.length !== messageIds.length) return undefined;
    const rowsById = new Map(rows.map((row) => [row.id, row]));
    if (provenance.some((item) => item.evidenceKind === 'PROVIDER_RECONCILED_SEND' && item.messageId && rowsById.get(item.messageId)?.direction !== 'OUTBOUND')) return undefined;
    if (provenance.some((item) => item.evidenceKind === 'PROVIDER_NON_DELIVERY' && !item.providerObservationKey)) return undefined;
    references.push(...rows.map(({id}) => ({evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId: id})));
  } else if (directReferences.length === 0 && providerReferences.length === 0) {
    return undefined;
  }

  return {
    evidenceRevision: candidate.evidenceRevision,
    sourceEventKey: candidate.sourceEventKey,
    references
  };
}

async function evidenceBasisForInterpretation(
  tx: Parameters<Parameters<Database['transaction']>[0]>[0],
  candidate: ResponsibilityInterpretationCandidate
): Promise<ResponsibilityEvidenceBasis | undefined> {
  const provenance = interpretationProvenance(candidate);
  const messageIds = [...new Set(provenance.map((item) => item.messageId).filter((value): value is string => Boolean(value)))];
  if (messageIds.length === 0 || messageIds.some((id) => !isUuid(id))) return undefined;
  const rows = await tx.select({
    id: messages.id,
    subject: messages.subject,
    textBody: messages.textBody,
    direction: messages.direction
  }).from(messages).where(and(
    eq(messages.userId, candidate.userId),
    eq(messages.connectedAccountId, candidate.connectedAccountId),
    eq(messages.conversationId, candidate.conversationId),
    inArray(messages.id, messageIds)
  ));
  if (rows.length !== messageIds.length) return undefined;
  const rowsById = new Map(rows.map((row) => [row.id, row]));
  for (const item of provenance) {
    const row = item.messageId ? rowsById.get(item.messageId) : undefined;
    if (!row) return undefined;
    if (item.sourceExcerptShort && !`${row.subject}\n${row.textBody ?? ''}`.includes(item.sourceExcerptShort)) return undefined;
    if (item.sourceLocator?.messageId && item.sourceLocator.messageId !== item.messageId) return undefined;
    const zone = item.sourceLocator?.zone;
    if (zone !== undefined && !['AUTHORED_CURRENT', 'QUOTED_HISTORY', 'FORWARDED_CONTENT', 'SIGNATURE', 'DISCLAIMER', 'STRUCTURED_METADATA'].includes(String(zone))) return undefined;
    const attachmentReference = item.sourceLocator?.attachmentId ?? item.sourceLocator?.providerAttachmentId;
    if (attachmentReference !== undefined) {
      const attachmentRows = await tx.select({id: attachments.id, providerAttachmentId: attachments.providerAttachmentId})
        .from(attachments).where(and(eq(attachments.messageId, row.id), eq(attachments.connectedAccountId, candidate.connectedAccountId)));
      if (!attachmentRows.some((attachment) => attachment.id === attachmentReference || attachment.providerAttachmentId === attachmentReference)) return undefined;
    }
  }
  const participantIds = [...new Set(candidate.semantics.flatMap((unit) => [
    ...(unit.obligationLegs ?? []).map((leg) => leg.participantId),
    ...(unit.expectedEvents ?? []).map((event) => event.participantId),
    ...(unit.assignmentSemantics?.candidateParticipantIds ?? []),
    unit.assignmentSemantics?.selectedParticipantId
  ]).filter((value): value is string => Boolean(value)))];
  if (participantIds.length > 0) {
    if (participantIds.some((id) => !isUuid(id))) return undefined;
    const participantRows = await tx.select({id: participantIdentities.id}).from(participantIdentities).where(and(
      eq(participantIdentities.userId, candidate.userId), inArray(participantIdentities.id, participantIds)
    ));
    if (participantRows.length !== participantIds.length) return undefined;
  }
  if (candidate.interpretationRunId) {
    if (!isUuid(candidate.interpretationRunId)) return undefined;
    const [run] = await tx.select().from(aiInterpretationRuns).where(and(
      eq(aiInterpretationRuns.id, candidate.interpretationRunId),
      eq(aiInterpretationRuns.userId, candidate.userId),
      eq(aiInterpretationRuns.conversationId, candidate.conversationId),
      eq(aiInterpretationRuns.basisEvidenceRevision, candidate.evidenceRevision)
    ));
    if (!run || (candidate.sourceMessageId && run.messageId !== candidate.sourceMessageId)) return undefined;
  }
  return {
    evidenceRevision: candidate.evidenceRevision,
    sourceEventKey: candidate.sourceEventKey,
    references: rows.map(({id}) => ({evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId: id}))
  };
}

export class ResponsibilityRepository {
  public constructor(private readonly db: Database = getDatabase()) {}

  public async getResponsibility(input: {
    userId: string;
    connectedAccountId: string;
    responsibilityId: string;
  }): Promise<{state: ResponsibilityState; projection: ReturnType<typeof projectResponsibility>} | null> {
    return this.db.transaction(async (tx) => {
      const state = await loadState(tx, input.responsibilityId, false);
      if (!state || state.userId !== input.userId || state.connectedAccountId !== input.connectedAccountId) return null;
      return {state, projection: projectResponsibility(state)};
    });
  }

  public async listResponsibilities(input: {
    userId: string;
    connectedAccountId?: string;
    conversationId?: string;
  }): Promise<Array<{state: ResponsibilityState; projection: ReturnType<typeof projectResponsibility>}>> {
    return this.db.transaction(async (tx) => {
      const predicates = [eq(responsibilities.userId, input.userId)];
      if (input.connectedAccountId) predicates.push(eq(responsibilities.connectedAccountId, input.connectedAccountId));
      if (input.conversationId) predicates.push(eq(responsibilities.conversationId, input.conversationId));
      const rows = await tx.select({id: responsibilities.id}).from(responsibilities).where(and(...predicates));
      const states = (await Promise.all(rows.map((row) => loadState(tx, row.id, false)))).filter((state): state is ResponsibilityState => Boolean(state));
      return states.map((state) => ({state, projection: projectResponsibility(state)}));
    });
  }

  /**
   * Production interpretation lane. It can submit language-level semantics,
   * never admission/effect/identity/provider authority. The trusted command is
   * derived only after scope, current revision, and evidence references resolve.
   */
  public async reduceCandidate(candidate: ResponsibilityInterpretationCandidate): Promise<ReductionResult> {
    const prepared = await this.db.transaction(async (tx) => {
      const [conversation] = await tx.select().from(conversations).where(and(
        eq(conversations.id, candidate.conversationId),
        eq(conversations.userId, candidate.userId),
        eq(conversations.connectedAccountId, candidate.connectedAccountId)
      )).for('update');
      if (!conversation) throw new Error('conversation is not owned by the current user and connected account');
      const provisionalAdmission: AdmissionDecision = candidate.admissionUncertainties?.some((item) => item.material && item.reviewRequired) || candidate.semantics.some((unit) => unit.materiality === 'UNCERTAIN')
        ? 'NEEDS_REVIEW'
        : candidate.semantics.some((unit) => unit.materiality === 'MATERIAL') ? 'TRACK' : 'DO_NOT_TRACK';
      if (candidate.evidenceRevision !== conversation.semanticEvidenceRevision) {
        return {kind: 'result' as const, result: {
          status: 'STALE' as const,
          admission: provisionalAdmission,
          reason: `candidate basis revision ${candidate.evidenceRevision} is not current revision ${conversation.semanticEvidenceRevision}`,
          effects: [] as [],
          responsibilities: []
        }};
      }
      const evidenceBasis = await evidenceBasisForInterpretation(tx, candidate);
      if (!evidenceBasis) return {kind: 'result' as const, result: {
        status: 'REJECTED' as const, admission: provisionalAdmission,
        reason: 'candidate provenance does not resolve in the authorized conversation evidence', effects: [] as [], responsibilities: []
      }};
      const rows = await tx.select({id: responsibilities.id}).from(responsibilities).where(and(
        eq(responsibilities.userId, candidate.userId),
        eq(responsibilities.connectedAccountId, candidate.connectedAccountId),
        eq(responsibilities.conversationId, candidate.conversationId)
      ));
      const states = (await Promise.all(rows.map((row) => loadState(tx, row.id, false)))).filter((state): state is ResponsibilityState => Boolean(state));
      const derived = deriveResponsibilityCommand(candidate, {evidenceBasis, existingResponsibilities: states});
      if (derived.status === 'REJECTED') return {kind: 'result' as const, result: {
        status: 'REJECTED' as const, admission: derived.admission, reason: derived.reason, effects: [] as [], responsibilities: []
      }};
      return {kind: 'command' as const, command: derived.command};
    });
    return prepared.kind === 'result' ? prepared.result : this.applyTrustedCommand(prepared.command);
  }

  /**
   * Applies one accepted candidate atomically. The Conversation row is the
   * evidence-revision serialization point; all effects from one source event
   * share the transaction and either all commit or none do.
   */
  public async applyTrustedCommand(candidate: TrustedResponsibilityCommand): Promise<ReductionResult> {
    return this.db.transaction(async (tx) => {
      const [conversation] = await tx
        .select()
        .from(conversations)
        .where(and(
          eq(conversations.id, candidate.conversationId),
          eq(conversations.userId, candidate.userId),
          eq(conversations.connectedAccountId, candidate.connectedAccountId)
        ))
        .for('update');
      if (!conversation) throw new Error('conversation is not owned by the current user and connected account');

      if (candidate.evidenceRevision !== conversation.semanticEvidenceRevision) {
        return {
          status: 'STALE',
          admission: candidate.admission.decision,
          reason: `candidate basis revision ${candidate.evidenceRevision} is not current revision ${conversation.semanticEvidenceRevision}`,
          effects: [],
          responsibilities: []
        };
      }

      const evidenceBasis = await evidenceBasisForCandidate(tx, candidate);
      const admission = admitTrustedResponsibilityCommand(candidate, {evidenceBasis});
      if (admission.status === 'INVALID_CANDIDATE') {
        return {
          status: 'REJECTED',
          admission: candidate.admission.decision,
          reason: admission.reason,
          effects: [],
          responsibilities: []
        };
      }

      const candidateEffects = effectsFor(candidate);
      const externalApplicationKey = (candidate.applicationKey?.trim() || candidate.sourceEventKey.trim());
      const externalEffectKeys = candidateEffects.map((effect, index) => effectKey(effect, candidate, index));
      if (!externalApplicationKey || externalApplicationKey.length > 128 || externalEffectKeys.some((key) => !key || key.length > 128) || new Set(externalEffectKeys).size !== externalEffectKeys.length) {
        return {
          status: 'REJECTED',
          admission: admission.decision,
          reason: 'application/effect keys must be unique, non-empty, and at most 128 characters',
          effects: [],
          responsibilities: []
        };
      }
      // Frozen L2 deliberately keeps global uniqueness. Runtime keys therefore
      // encode tenant/account scope before they reach that global constraint.
      const applicationKey = scopedMachineKey('app', [candidate.userId, candidate.connectedAccountId, externalApplicationKey]);
      const effectKeys = externalEffectKeys.map((key) => scopedMachineKey('fx', [candidate.userId, candidate.connectedAccountId, externalApplicationKey, key]));

      const priorEvents = await tx
        .select()
        .from(responsibilityDomainEvents)
        .where(eq(responsibilityDomainEvents.applicationKey, applicationKey));
      const priorEffectKeys = new Set(priorEvents.map((event) => event.effectKey));
      if (priorEvents.length > 0 && (priorEvents.length !== effectKeys.length || effectKeys.some((key) => !priorEffectKeys.has(key)))) {
        throw new Error('idempotency application effect set differs from its durable record; refusing partial or altered replay');
      }
      if (priorEvents.length === effectKeys.length) {
        if (priorEvents.some((event) => event.userId !== candidate.userId)) {
          throw new Error('idempotency replay scope mismatch');
        }
        const ids = priorEvents
          .map((event) => (event.changeSummary as {responsibilityId?: string}).responsibilityId)
          .filter((id): id is string => Boolean(id));
        const states = (await Promise.all([...new Set(ids)].map((id) => loadState(tx, id, false)))).filter((state): state is ResponsibilityState => Boolean(state));
        if (states.length !== new Set(ids).size || states.some((state) =>
          state.userId !== candidate.userId ||
          state.connectedAccountId !== candidate.connectedAccountId ||
          state.conversationId !== candidate.conversationId
        )) throw new Error('idempotency replay result is outside the authorized scope');
        return {
          status: 'APPLIED',
          admission: admission.decision,
          effects: effectKeys.map((key) => {
            const event = priorEvents.find((item) => item.effectKey === key) as typeof priorEvents[number];
            return {
            operation: event.operation as ResponsibilityEffectInput['operation'],
            responsibilityId: (event.changeSummary as {responsibilityId?: string}).responsibilityId,
            changed: false,
            reason: 'idempotent effect replay performed no mutation'
            };
          }),
          responsibilities: states
        };
      }

      if (admission.decision === 'DO_NOT_TRACK') {
        await tx.update(responsibilityAdmissionReviews).set({
          reviewStatus: 'RESOLVED',
          resolution: 'DO_NOT_TRACK',
          resolvedByActorKind: 'SYSTEM_REDUCER',
          resolvedAt: new Date(),
          aggregateVersion: sql`${responsibilityAdmissionReviews.aggregateVersion} + 1`,
          updatedAt: new Date()
        }).where(and(
          eq(responsibilityAdmissionReviews.connectedAccountId, candidate.connectedAccountId),
          eq(responsibilityAdmissionReviews.sourceEventKey, candidate.sourceEventKey),
          eq(responsibilityAdmissionReviews.candidateKey, candidate.candidateKey),
          eq(responsibilityAdmissionReviews.reviewStatus, 'OPEN')
        ));
        return {status: 'APPLIED', admission: 'DO_NOT_TRACK', effects: [], responsibilities: []};
      }

      if (admission.decision === 'NEEDS_REVIEW') {
        const [sameRevision] = await tx
          .select()
          .from(responsibilityAdmissionReviews)
          .where(and(
            eq(responsibilityAdmissionReviews.connectedAccountId, candidate.connectedAccountId),
            eq(responsibilityAdmissionReviews.sourceEventKey, candidate.sourceEventKey),
            eq(responsibilityAdmissionReviews.candidateKey, candidate.candidateKey),
            eq(responsibilityAdmissionReviews.basisEvidenceRevision, candidate.evidenceRevision)
          ))
          .for('update');
        if (sameRevision) {
          const review: AdmissionReviewState = {
            id: sameRevision.id,
            userId: sameRevision.userId,
            connectedAccountId: sameRevision.connectedAccountId,
            conversationId: sameRevision.conversationId,
            sourceEventKey: sameRevision.sourceEventKey,
            candidateKey: sameRevision.candidateKey,
            evidenceRevision: sameRevision.basisEvidenceRevision,
            reasonCodes: sameRevision.reasonCodes,
            candidateSummary: sameRevision.candidateSummary,
            status: sameRevision.reviewStatus as AdmissionReviewState['status'],
            ...(sameRevision.resolution ? {resolution: sameRevision.resolution as AdmissionReviewState['resolution']} : {})
          };
          return {status: 'APPLIED', admission: 'NEEDS_REVIEW', effects: [], responsibilities: [], admissionReview: review};
        }
        const [existing] = await tx
          .select()
          .from(responsibilityAdmissionReviews)
          .where(and(
            eq(responsibilityAdmissionReviews.connectedAccountId, candidate.connectedAccountId),
            eq(responsibilityAdmissionReviews.sourceEventKey, candidate.sourceEventKey),
            eq(responsibilityAdmissionReviews.candidateKey, candidate.candidateKey),
            eq(responsibilityAdmissionReviews.reviewStatus, 'OPEN')
          ))
          .for('update');
        const reviewId = existing?.id ?? stableUuid(`${candidate.connectedAccountId}:admission:${candidate.sourceEventKey}:${candidate.candidateKey}:${candidate.evidenceRevision}`);
        if (!existing) {
          await tx.insert(responsibilityAdmissionReviews).values({
            id: reviewId,
            userId: candidate.userId,
            connectedAccountId: candidate.connectedAccountId,
            conversationId: candidate.conversationId,
            reviewStatus: 'OPEN',
            reasonCodes: candidate.admission.reasonCodes,
            candidateSchemaVersion: 1,
            candidateSummary: candidate.admission.candidateSummary ?? {},
            basisEvidenceRevision: candidate.evidenceRevision,
            aggregateVersion: 1,
            sourceEventKey: candidate.sourceEventKey,
            candidateKey: candidate.candidateKey,
            interpretationRunId: nullableUuid(candidate.interpretationRunId),
            createdAt: new Date(),
            updatedAt: new Date()
          });
          await this.writeReviewProvenance(tx, reviewId, candidate);
        }
        const review: AdmissionReviewState = {
          id: reviewId,
          userId: candidate.userId,
          connectedAccountId: candidate.connectedAccountId,
          conversationId: candidate.conversationId,
          sourceEventKey: candidate.sourceEventKey,
          candidateKey: candidate.candidateKey,
          evidenceRevision: existing?.basisEvidenceRevision ?? candidate.evidenceRevision,
          reasonCodes: existing?.reasonCodes ?? candidate.admission.reasonCodes,
          candidateSummary: (existing?.candidateSummary ?? candidate.admission.candidateSummary ?? {}) as Record<string, unknown>,
          status: 'OPEN'
        };
        return {status: 'APPLIED', admission: 'NEEDS_REVIEW', effects: [], responsibilities: [], admissionReview: review};
      }

      const targetIds = candidateEffects
        .map((effect) => effect.operation === 'CREATE' ? undefined : effect.responsibilityRef)
        .filter((id): id is string => Boolean(id));
      const existingStates = (await Promise.all([...new Set(targetIds)].map((id) => loadState(tx, id)))).filter((state): state is ResponsibilityState => Boolean(state));
      const pureResult = reduceResponsibility(candidate, {
        currentEvidenceRevision: conversation.semanticEvidenceRevision,
        evidenceBasis,
        existingResponsibilities: existingStates,
        idFactory: (source, effect, index) => stableUuid(`${source.connectedAccountId}:responsibility:${source.sourceEventKey}:${effectKey(effect, source, index)}`),
        now: new Date()
      });
      if (pureResult.status !== 'APPLIED') return pureResult;

      const persistedEffects = [] as typeof pureResult.effects;
      for (const [index, effectResult] of pureResult.effects.entries()) {
        if (!effectResult.state) {
          persistedEffects.push(effectResult);
          continue;
        }
        const state = persistedStateIds(effectResult.state);
        if (effectResult.changed && effectResult.operation === 'CREATE') {
          await tx.insert(responsibilities).values({
            id: state.id,
            userId: state.userId,
            connectedAccountId: state.connectedAccountId,
            conversationId: state.conversationId,
            operationalOutcome: state.operationalOutcome,
            resolutionStatus: state.resolutionStatus,
            resolutionReason: state.resolutionReason ?? null,
            liveTrackingState: state.liveTrackingState,
            attentionMode: state.attentionMode,
            semanticDetailsVersion: 1,
            semanticDetails: detailsForDatabase(state.details),
            acceptedEvidenceRevision: state.acceptedEvidenceRevision,
            aggregateVersion: state.aggregateVersion,
            resolvedAt: state.resolvedAt ? new Date(state.resolvedAt) : null,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } else if (effectResult.changed) {
          await tx.update(responsibilities).set({
            operationalOutcome: state.operationalOutcome,
            resolutionStatus: state.resolutionStatus,
            resolutionReason: state.resolutionReason ?? null,
            liveTrackingState: state.liveTrackingState,
            attentionMode: state.attentionMode,
            semanticDetails: detailsForDatabase(state.details),
            acceptedEvidenceRevision: state.acceptedEvidenceRevision,
            aggregateVersion: state.aggregateVersion,
            resolvedAt: state.resolvedAt ? new Date(state.resolvedAt) : null,
            updatedAt: new Date()
          }).where(and(eq(responsibilities.id, state.id), eq(responsibilities.userId, candidate.userId), eq(responsibilities.connectedAccountId, candidate.connectedAccountId)));
        }
        if (effectResult.changed) {
          await this.writeChildren(tx, state);
          await this.writeFieldDecisions(tx, state, new Date(), candidate.evidenceRevision);
        }
        const beforeVersion = state.aggregateVersion - (effectResult.changed ? 1 : 0);
        const domainEventId = stableUuid(`${applicationKey}:${effectKeys[index]}:domain-event`);
        await tx.insert(responsibilityDomainEvents).values({
          id: domainEventId,
          responsibilityId: state.id,
          userId: candidate.userId,
          operation: effectResult.operation,
          actorKind: 'SYSTEM_REDUCER',
          reasonCodes: candidateEffects[index]?.reasonCodes?.length ? candidateEffects[index].reasonCodes : candidate.admission.reasonCodes,
          basisEvidenceRevision: candidate.evidenceRevision,
          aggregateVersionBefore: beforeVersion,
          aggregateVersionAfter: state.aggregateVersion,
          mutatesState: effectResult.changed,
          sourceEventKey: candidate.sourceEventKey,
          applicationKey,
          effectKey: effectKeys[index],
          correlationId: stableUuid(`${candidate.correlationId ?? applicationKey}:correlation`),
          reducerVersion: RESPONSIBILITY_REDUCER_VERSION,
          interpretationRunId: nullableUuid(candidate.interpretationRunId),
          changeSummary: {
            responsibilityId: state.id,
            operation: effectResult.operation,
            reason: state.resolutionReason ?? effectResult.reason,
            projection: projectResponsibility(state)
          },
          occurredAt: new Date()
        });
        await this.writeResponsibilityProvenance(tx, state, domainEventId, candidate, candidateEffects[index]);
        persistedEffects.push({...effectResult, state, projection: projectResponsibility(state)});
      }

      const admittedResponsibilityId = persistedEffects.find((effect) => effect.state)?.responsibilityId;
      if (admittedResponsibilityId) {
        await tx.update(responsibilityAdmissionReviews).set({
          reviewStatus: 'RESOLVED',
          resolution: 'TRACK',
          admittedResponsibilityId,
          resolvedByActorKind: 'SYSTEM_REDUCER',
          resolvedAt: new Date(),
          aggregateVersion: sql`${responsibilityAdmissionReviews.aggregateVersion} + 1`,
          updatedAt: new Date()
        }).where(and(
          eq(responsibilityAdmissionReviews.connectedAccountId, candidate.connectedAccountId),
          eq(responsibilityAdmissionReviews.sourceEventKey, candidate.sourceEventKey),
          eq(responsibilityAdmissionReviews.candidateKey, candidate.candidateKey),
          eq(responsibilityAdmissionReviews.reviewStatus, 'OPEN')
        ));
      }

      return {
        status: 'APPLIED',
        admission: 'TRACK',
        effects: persistedEffects,
        responsibilities: persistedEffects
          .map((effect) => effect.state)
          .filter((state): state is ResponsibilityState => Boolean(state))
      };
    });
  }

  public async admitAndReduce(candidate: ResponsibilityInterpretationCandidate): Promise<ReductionResult> {
    return this.reduceCandidate(candidate);
  }

  public async applyAcceptedCandidate(candidate: TrustedResponsibilityCommand): Promise<ReductionResult> {
    return this.applyTrustedCommand(candidate);
  }

  public async resolveAdmissionReview(input: {
    userId: string;
    reviewId: string;
    resolution: 'TRACK' | 'DO_NOT_TRACK';
    actorKind: string;
  }): Promise<void> {
    await this.db.transaction(async (tx) => {
      const [review] = await tx.select().from(responsibilityAdmissionReviews).where(and(eq(responsibilityAdmissionReviews.id, input.reviewId), eq(responsibilityAdmissionReviews.userId, input.userId))).for('update');
      if (!review) throw new Error('admission review is not owned by the current user');
      if (review.reviewStatus === 'RESOLVED') {
        if (review.resolution !== input.resolution) throw new Error('admission review already has a different terminal resolution');
        return;
      }
      if (input.resolution === 'TRACK') throw new Error('TRACK review resolution must be applied with an admitted Responsibility candidate');
      await tx.update(responsibilityAdmissionReviews).set({
        reviewStatus: 'RESOLVED',
        resolution: 'DO_NOT_TRACK',
        resolvedByActorKind: input.actorKind,
        resolvedAt: new Date(),
        aggregateVersion: sql`${responsibilityAdmissionReviews.aggregateVersion} + 1`,
        updatedAt: new Date()
      }).where(eq(responsibilityAdmissionReviews.id, input.reviewId));
    });
  }

  private async writeReviewProvenance(tx: Parameters<Parameters<Database['transaction']>[0]>[0], reviewId: string, candidate: TrustedResponsibilityCommand): Promise<void> {
    const provenance = candidate.provenance ?? [];
    await tx.insert(responsibilityProvenanceRefs).values(provenance.map((item, index) => ({
      id: stableUuid(`${reviewId}:provenance:${index}`),
      userId: candidate.userId,
      connectedAccountId: candidate.connectedAccountId,
      admissionReviewId: reviewId,
      targetKind: 'ADMISSION_REVIEW',
      targetId: reviewId,
      fieldKey: item.fieldKey ?? null,
      supportRole: item.supportRole ?? null,
      evidenceKind: item.evidenceKind,
      messageId: canReferenceMessage(item.messageId),
      providerObservationKey: item.providerObservationKey ?? null,
      interpretationRunId: nullableUuid(item.interpretationRunId ?? candidate.interpretationRunId),
      sourceLocator: safeSourceLocator(item),
      sourceExcerptShort: item.sourceExcerptShort ?? null,
      createdAt: new Date()
    })));
  }

  private async writeResponsibilityProvenance(
    tx: Parameters<Parameters<Database['transaction']>[0]>[0],
    state: ResponsibilityState,
    domainEventId: string,
    candidate: TrustedResponsibilityCommand,
    effect: ResponsibilityEffectInput | undefined
  ): Promise<void> {
    const mapped: Array<{item: ProvenanceInput; targetKind: string; targetId?: string; fieldKey?: string}> = [];
    const add = (items: readonly ProvenanceInput[], targetKind: string, targetId?: string, fieldKey?: string) => {
      for (const item of items) mapped.push({item, targetKind, targetId, fieldKey});
    };
    add(candidate.provenance ?? [], 'RESPONSIBILITY', state.id);
    add(effect?.provenance ?? [], 'RESPONSIBILITY', state.id);
    for (const change of effect?.patch?.fieldChanges ?? []) {
      const fieldDecisionId = stableUuid(`${state.id}:field:${change.fieldKey}:${candidate.evidenceRevision}:${change.semanticTime ?? ''}`);
      add(change.provenance ?? [], 'FIELD_DECISION', fieldDecisionId, change.fieldKey);
    }
    for (const leg of state.obligationLegs) add(leg.provenance, 'OBLIGATION_LEG', leg.id, `obligationLegs/${leg.id}`);
    for (const event of state.expectedEvents) add(event.provenance, 'EXPECTED_EVENT', event.id, `expectedEvents/${event.id}`);
    for (const fact of state.temporalFacts) add(fact.provenance, 'TEMPORAL_FACT', fact.id, `temporalFacts/${fact.id}`);
    for (const item of state.details.completionCriteria) add(item.provenance, 'COMPLETION_CRITERION', undefined, `completionCriteria/${item.id}`);
    for (const item of state.details.constraints) add(item.provenance, 'CONSTRAINT', undefined, `constraints/${item.id}`);
    for (const item of state.details.pendingProposals) add(item.provenance, 'PENDING_PROPOSAL', undefined, `pendingProposals/${item.id}`);
    for (const item of state.details.agreedFacts) add(item.provenance, 'AGREED_FACT', undefined, `agreedFacts/${item.id}`);
    for (const item of state.details.uncertainties) add(item.provenance, 'UNCERTAINTY', undefined, `uncertainties/${item.id}`);
    for (const item of state.details.riskDetails) add(item.provenance, 'RISK_DETAIL', undefined, `riskDetails/${item.id}`);
    if (mapped.length === 0) return;
    const signature = (value: {item: ProvenanceInput; targetKind: string; targetId?: string; fieldKey?: string}) => JSON.stringify([
      value.targetKind, value.targetId ?? null, value.fieldKey ?? value.item.fieldKey ?? null,
      value.item.supportRole ?? null, value.item.evidenceKind, value.item.messageId ?? null,
      value.item.providerObservationKey ?? null, value.item.interpretationRunId ?? candidate.interpretationRunId ?? null,
      value.item.sourceLocator ?? {}, value.item.sourceExcerptShort ?? null
    ]);
    const existing = await tx.select().from(responsibilityProvenanceRefs).where(eq(responsibilityProvenanceRefs.responsibilityId, state.id));
    const existingSignatures = new Set(existing.map((reference) => JSON.stringify([
      reference.targetKind, reference.targetId, reference.fieldKey, reference.supportRole,
      reference.evidenceKind, reference.messageId, reference.providerObservationKey,
      reference.interpretationRunId, reference.sourceLocator, reference.sourceExcerptShort
    ])));
    const seen = new Set<string>();
    const novel = mapped.filter((value) => {
      const key = signature(value);
      if (existingSignatures.has(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (novel.length === 0) return;
    await tx.insert(responsibilityProvenanceRefs).values(novel.map(({item, targetKind, targetId, fieldKey}, index) => ({
      id: stableUuid(`${domainEventId}:provenance:${index}`),
      userId: state.userId,
      connectedAccountId: state.connectedAccountId,
      responsibilityId: state.id,
      targetKind,
      targetId: nullableUuid(targetId),
      fieldKey: fieldKey ?? item.fieldKey ?? null,
      supportRole: item.supportRole ?? null,
      evidenceKind: item.evidenceKind,
      messageId: canReferenceMessage(item.messageId),
      providerObservationKey: item.providerObservationKey ?? null,
      interpretationRunId: nullableUuid(item.interpretationRunId ?? candidate.interpretationRunId),
      domainEventId,
      sourceLocator: safeSourceLocator(item),
      sourceExcerptShort: item.sourceExcerptShort ?? null,
      createdAt: new Date()
    })));
  }

  private async writeChildren(tx: Parameters<Parameters<Database['transaction']>[0]>[0], state: ResponsibilityState): Promise<void> {
    // Expected events are written first because an obligation leg may carry a
    // same-Responsibility activation_event_id foreign key.
    await this.writeExpectedEvents(tx, state);
    for (const leg of state.obligationLegs) {
      const participantId = leg.bearer === 'USER' ? null : nullableUuid(leg.participantId);
      if (leg.bearer !== 'USER' && !participantId) throw new Error(`obligation leg ${leg.id} needs a tenant-owned participant ID`);
      await tx.insert(responsibilityObligationLegs).values({
        id: leg.id,
        responsibilityId: state.id,
        userId: state.userId,
        bearerKind: leg.bearer === 'USER' ? 'USER' : 'PARTICIPANT',
        bearerParticipantId: participantId,
        actionCode: leg.actionCode,
        actionSummary: nullableText(leg.actionSummary),
        objectSummary: nullableText(leg.objectSummary),
        legStatus: leg.status,
        closureReason: nullableText(leg.closureReason),
        actionability: leg.actionability,
        basisKind: leg.basisKind,
        authorityStatus: nullableText(leg.authorityStatus),
        activationEventId: nullableUuid(leg.activationEventId),
        closedAt: leg.closedAt ? new Date(leg.closedAt) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).onConflictDoUpdate({
        target: responsibilityObligationLegs.id,
        set: {
          bearerKind: leg.bearer === 'USER' ? 'USER' : 'PARTICIPANT',
          bearerParticipantId: participantId,
          actionCode: leg.actionCode,
          actionSummary: nullableText(leg.actionSummary),
          objectSummary: nullableText(leg.objectSummary),
          legStatus: leg.status,
          closureReason: nullableText(leg.closureReason),
          actionability: leg.actionability,
          basisKind: leg.basisKind,
          authorityStatus: nullableText(leg.authorityStatus),
          activationEventId: nullableUuid(leg.activationEventId),
          closedAt: leg.closedAt ? new Date(leg.closedAt) : null,
          updatedAt: new Date()
        }
      });
    }
    for (const fact of state.temporalFacts) {
      await tx.insert(responsibilityTemporalFacts).values({
        id: fact.id,
        responsibilityId: state.id,
        temporalKind: fact.temporalKind,
        obligationLegId: nullableUuid(fact.obligationLegId),
        expectedEventId: nullableUuid(fact.expectedEventId),
        originalExpression: nullableText(fact.originalExpression),
        valueKind: fact.valueKind,
        resolvedDate: fact.resolvedDate ?? null,
        resolvedAt: fact.resolvedAt ? new Date(fact.resolvedAt) : null,
        precisionCode: fact.precisionCode,
        referenceTimezone: nullableText(fact.referenceTimezone),
        anchorKind: nullableText(fact.anchorKind),
        anchorReference: nullableText(fact.anchorReference),
        anchorOffsetSeconds: fact.anchorOffsetSeconds ?? null,
        currentnessStatus: fact.currentnessStatus,
        authorityStatus: nullableText(fact.authorityStatus),
        supersededAt: fact.supersededAt ? new Date(fact.supersededAt) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).onConflictDoUpdate({
        target: responsibilityTemporalFacts.id,
        set: {
          temporalKind: fact.temporalKind,
          obligationLegId: nullableUuid(fact.obligationLegId),
          expectedEventId: nullableUuid(fact.expectedEventId),
          originalExpression: nullableText(fact.originalExpression),
          valueKind: fact.valueKind,
          resolvedDate: fact.resolvedDate ?? null,
          resolvedAt: fact.resolvedAt ? new Date(fact.resolvedAt) : null,
          precisionCode: fact.precisionCode,
          referenceTimezone: nullableText(fact.referenceTimezone),
          anchorKind: nullableText(fact.anchorKind),
          anchorReference: nullableText(fact.anchorReference),
          anchorOffsetSeconds: fact.anchorOffsetSeconds ?? null,
          currentnessStatus: fact.currentnessStatus,
          authorityStatus: nullableText(fact.authorityStatus),
          supersededAt: fact.supersededAt ? new Date(fact.supersededAt) : null,
          updatedAt: new Date()
        }
      });
    }
  }

  private async writeExpectedEvents(tx: Parameters<Parameters<Database['transaction']>[0]>[0], state: ResponsibilityState): Promise<void> {
    for (const event of state.expectedEvents) {
      const participantId = event.actor === 'EXTERNAL' ? null : nullableUuid(event.participantId);
      if (event.actor !== 'EXTERNAL' && !participantId) throw new Error(`expected event ${event.id} needs a tenant-owned participant ID`);
      await tx.insert(responsibilityExpectedEvents).values({
        id: event.id,
        responsibilityId: state.id,
        userId: state.userId,
        actorKind: event.actor === 'EXTERNAL' ? 'EXTERNAL' : 'PARTICIPANT',
        actorParticipantId: participantId,
        eventCode: event.eventCode,
        eventSummary: nullableText(event.eventSummary),
        eventStatus: event.status === 'PENDING' ? 'PENDING' : 'CLOSED',
        closureReason: nullableText(event.closureReason),
        basisKind: nullableText(event.basisKind),
        expectationStrength: nullableText(event.expectationStrength),
        satisfiedAt: event.satisfiedAt ? new Date(event.satisfiedAt) : null,
        closedAt: event.closedAt ? new Date(event.closedAt) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).onConflictDoUpdate({
        target: responsibilityExpectedEvents.id,
        set: {
          actorKind: event.actor === 'EXTERNAL' ? 'EXTERNAL' : 'PARTICIPANT',
          actorParticipantId: participantId,
          eventCode: event.eventCode,
          eventSummary: nullableText(event.eventSummary),
          eventStatus: event.status === 'PENDING' ? 'PENDING' : 'CLOSED',
          closureReason: nullableText(event.closureReason),
          basisKind: nullableText(event.basisKind),
          expectationStrength: nullableText(event.expectationStrength),
          satisfiedAt: event.satisfiedAt ? new Date(event.satisfiedAt) : null,
          closedAt: event.closedAt ? new Date(event.closedAt) : null,
          updatedAt: new Date()
        }
      });
    }
  }

  private async writeFieldDecisions(tx: Parameters<Parameters<Database['transaction']>[0]>[0], state: ResponsibilityState, now: Date, currentRevision: number): Promise<void> {
    const latest = new Map<string, typeof state.fieldDecisions[number]>();
    // A normal UPDATE may carry no field correction. Existing active
    // decisions must remain active; only decisions authored on this evidence
    // revision are materialized below.
    for (const decision of state.fieldDecisions) {
      if (decision.basisEvidenceRevision === currentRevision) latest.set(decision.fieldKey, decision);
    }
    for (const [fieldKey, decision] of latest) {
      await tx.update(responsibilityFieldDecisions).set({decisionStatus: 'SUPERSEDED', supersededAt: now}).where(and(eq(responsibilityFieldDecisions.responsibilityId, state.id), eq(responsibilityFieldDecisions.fieldKey, fieldKey), eq(responsibilityFieldDecisions.decisionStatus, 'ACTIVE')));
      await tx.insert(responsibilityFieldDecisions).values({
        id: stableUuid(`${state.id}:field:${fieldKey}:${decision.basisEvidenceRevision}:${decision.semanticTime ?? ''}`),
        responsibilityId: state.id,
        fieldKey,
        valueSchemaVersion: 1,
        valueJsonb: {
          __lunowaFieldDecision: true,
          value: decision.value,
          ...(decision.semanticTime ? {semanticTime: decision.semanticTime} : {})
        },
        authorityKind: decision.authorityKind,
        basisEvidenceRevision: decision.basisEvidenceRevision,
        decisionStatus: 'ACTIVE',
        createdAt: now
      }).onConflictDoNothing();
    }
  }
}

export const ResponsibilityDomainRepository = ResponsibilityRepository;
