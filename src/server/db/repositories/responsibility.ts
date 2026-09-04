import {and, asc, eq, inArray, sql} from 'drizzle-orm';

import {getDatabase} from '../index';
import {conversations, messages} from '../schema/evidence';
import {
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
  admitResponsibilityCandidate,
  projectResponsibility,
  reduceResponsibility,
  RESPONSIBILITY_REDUCER_VERSION
} from '../../responsibility';
import type {
  AdmissionReviewState,
  ObligationLeg,
  ProvenanceInput,
  ResponsibilityDetails,
  ResponsibilityEvidenceBasis,
  ResponsibilityEffectInput,
  ResponsibilityInterpretationCandidate,
  ResponsibilityState,
  TemporalFact,
  ReductionResult
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

function nullableUuid(value: string | undefined): string | null {
  return isUuid(value) ? value : null;
}

function nullableText(value: string | undefined): string | null {
  return value ?? null;
}

function effectsFor(candidate: ResponsibilityInterpretationCandidate): ResponsibilityEffectInput[] {
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

function effectKey(effect: ResponsibilityEffectInput, candidate: ResponsibilityInterpretationCandidate, index: number): string {
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
      provenance: []
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
      provenance: []
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
      provenance: []
    })),
    details: {
      completionCriteria: (rawDetails.completionCriteria ?? []).map((item) => ({...item, provenance: item.provenance ?? []})),
      constraints: (rawDetails.constraints ?? []).map((item) => ({...item, provenance: item.provenance ?? []})),
      pendingProposals: (rawDetails.pendingProposals ?? []).map((item) => ({...item, provenance: item.provenance ?? []})),
      agreedFacts: (rawDetails.agreedFacts ?? []).map((item) => ({...item, provenance: item.provenance ?? []})),
      uncertainties: (rawDetails.uncertainties ?? []).map((item) => ({...item, provenance: item.provenance ?? []})),
      assignmentSemantics: rawDetails.assignmentSemantics,
      riskDetails: (rawDetails.riskDetails ?? []).map((item) => ({...item, provenance: item.provenance ?? []}))
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
      provenance: []
    })),
    provenance: provenanceRefs.map((reference): ProvenanceInput => ({
      ...(reference.fieldKey ? {fieldKey: reference.fieldKey} : {}),
      ...(reference.supportRole ? {supportRole: reference.supportRole} : {}),
      evidenceKind: reference.evidenceKind,
      ...(reference.messageId ? {messageId: reference.messageId} : {}),
      ...(reference.providerObservationKey ? {providerObservationKey: reference.providerObservationKey} : {}),
      ...(reference.interpretationRunId ? {interpretationRunId: reference.interpretationRunId} : {}),
      ...(reference.sourceLocator ? {sourceLocator: reference.sourceLocator} : {}),
      ...(reference.sourceExcerptShort ? {sourceExcerptShort: reference.sourceExcerptShort} : {})
    })),
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

function candidateProvenance(candidate: ResponsibilityInterpretationCandidate): ProvenanceInput[] {
  return [
    ...(candidate.provenance ?? []),
    ...(candidate.effects?.flatMap((effect) => [
      ...(effect.provenance ?? []),
      ...(effect.patch?.fieldChanges?.flatMap((change) => change.provenance ?? []) ?? [])
    ]) ?? [])
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
  candidate: ResponsibilityInterpretationCandidate
): Promise<ResponsibilityEvidenceBasis | undefined> {
  const provenance = candidateProvenance(candidate);
  const messageIds = [...new Set(
    provenance
      .map((item) => item.messageId)
      .filter((value): value is string => Boolean(value))
  )];
  const directReferences = provenance.filter(isAuthorizedDirectEvidence);
  const references: ProvenanceInput[] = [...directReferences];

  if (messageIds.length > 0) {
    if (messageIds.some((id) => !isUuid(id))) return undefined;
    const rows = await tx
      .select({id: messages.id})
      .from(messages)
      .where(and(
        eq(messages.userId, candidate.userId),
        eq(messages.connectedAccountId, candidate.connectedAccountId),
        eq(messages.conversationId, candidate.conversationId),
        inArray(messages.id, messageIds)
      ));
    if (rows.length !== messageIds.length) return undefined;
    references.push(...rows.map(({id}) => ({evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId: id})));
  } else if (directReferences.length === 0) {
    return undefined;
  }

  return {
    evidenceRevision: candidate.evidenceRevision,
    sourceEventKey: candidate.sourceEventKey,
    references
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
   * Applies one accepted candidate atomically. The Conversation row is the
   * evidence-revision serialization point; all effects from one source event
   * share the transaction and either all commit or none do.
   */
  public async reduceCandidate(candidate: ResponsibilityInterpretationCandidate): Promise<ReductionResult> {
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
      const admission = admitResponsibilityCandidate(candidate, {evidenceBasis});
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
      const applicationKey = (candidate.applicationKey?.trim() || candidate.sourceEventKey.trim());
      const effectKeys = candidateEffects.map((effect, index) => effectKey(effect, candidate, index));
      if (!applicationKey || applicationKey.length > 128 || effectKeys.some((key) => !key || key.length > 128)) {
        return {
          status: 'REJECTED',
          admission: admission.decision,
          reason: 'application and effect keys must be non-empty and at most 128 characters',
          effects: [],
          responsibilities: []
        };
      }

      const priorEvents = await tx
        .select()
        .from(responsibilityDomainEvents)
        .where(and(eq(responsibilityDomainEvents.applicationKey, applicationKey), inArray(responsibilityDomainEvents.effectKey, effectKeys)));
      if (priorEvents.length > 0 && priorEvents.length !== effectKeys.length) {
        throw new Error('incomplete idempotency record for one application; refusing a partial effect replay');
      }
      if (priorEvents.length === effectKeys.length) {
        const ids = priorEvents
          .map((event) => (event.changeSummary as {responsibilityId?: string}).responsibilityId)
          .filter((id): id is string => Boolean(id));
        const states = (await Promise.all([...new Set(ids)].map((id) => loadState(tx, id, false)))).filter((state): state is ResponsibilityState => Boolean(state));
        return {
          status: 'APPLIED',
          admission: admission.decision,
          effects: effectKeys.map((key) => {
            const event = priorEvents.find((item) => item.effectKey === key) as typeof priorEvents[number];
            return {
            operation: event.operation as ResponsibilityEffectInput['operation'],
            responsibilityId: (event.changeSummary as {responsibilityId?: string}).responsibilityId,
            changed: event.mutatesState,
            reason: 'idempotent effect already applied'
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

  public async applyAcceptedCandidate(candidate: ResponsibilityInterpretationCandidate): Promise<ReductionResult> {
    return this.reduceCandidate(candidate);
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

  private async writeReviewProvenance(tx: Parameters<Parameters<Database['transaction']>[0]>[0], reviewId: string, candidate: ResponsibilityInterpretationCandidate): Promise<void> {
    const provenance = candidate.provenance ?? [];
    await tx.insert(responsibilityProvenanceRefs).values(provenance.map((item, index) => ({
      id: stableUuid(`${reviewId}:provenance:${index}`),
      userId: candidate.userId,
      connectedAccountId: candidate.connectedAccountId,
      admissionReviewId: reviewId,
      targetKind: 'ADMISSION_REVIEW',
      targetId: nullableUuid(item.messageId),
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
    candidate: ResponsibilityInterpretationCandidate,
    effect: ResponsibilityEffectInput | undefined
  ): Promise<void> {
    const fieldProvenance = effect?.patch?.fieldChanges?.flatMap((change) =>
      (change.provenance ?? []).map((item) => ({
        ...item,
        fieldKey: item.fieldKey ?? change.fieldKey
      }))
    ) ?? [];
    const provenance = [
      ...(candidate.provenance ?? []),
      ...(effect?.provenance ?? []),
      ...fieldProvenance
    ];
    await tx.insert(responsibilityProvenanceRefs).values(provenance.map((item, index) => ({
      id: stableUuid(`${domainEventId}:provenance:${index}`),
      userId: state.userId,
      connectedAccountId: state.connectedAccountId,
      responsibilityId: state.id,
      targetKind: 'RESPONSIBILITY',
      targetId: state.id,
      fieldKey: item.fieldKey ?? null,
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
