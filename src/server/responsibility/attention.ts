import {projectResponsibility} from './projection';
import {reduceResponsibility} from './reducer';
import type {
  AttentionMode,
  ObligationLeg,
  ProvenanceInput,
  Projection,
  ResponsibilityEvidenceBasis,
  ResponsibilityPatch,
  ResponsibilityState,
  TrustedResponsibilityCommand
} from './types';

export type AttentionSurface = 'NEEDS_YOU' | 'MANAGED' | 'LATER' | 'REVIEW' | 'DONE' | 'NONE';

export type AttentionProjectionItem = {
  responsibilityId: string;
  projection: Projection;
  surface: AttentionSurface;
  state: ResponsibilityState;
  nearestRelevantTime?: string;
  overdue: boolean;
};

export type ConversationAttentionProjection = {
  conversationId?: string;
  items: AttentionProjectionItem[];
  needsYou: AttentionProjectionItem[];
  managed: AttentionProjectionItem[];
  later: AttentionProjectionItem[];
  review: AttentionProjectionItem[];
  done: AttentionProjectionItem[];
  none: AttentionProjectionItem[];
  primaryResponsibilityId?: string;
  primary?: AttentionProjectionItem;
  strictZero: boolean;
  derivedAt: string;
};

export type AttentionCommandInput = {
  state: ResponsibilityState;
  requestKey: string;
  evidenceRevision?: number;
  now?: Date;
  returnConditionKey?: string;
};

function surfaceFor(projection: Projection): AttentionSurface {
  switch (projection.bucket) {
    case 'MY_TURN': return 'NEEDS_YOU';
    case 'WAITING': return 'MANAGED';
    default: return projection.bucket;
  }
}

function temporalValue(state: ResponsibilityState): string | undefined {
  const values = state.temporalFacts
    .filter((fact) => fact.currentnessStatus === 'ACCEPTED_CURRENT' && (fact.valueKind === 'DATE' || fact.valueKind === 'INSTANT'))
    .map((fact) => fact.valueKind === 'DATE' ? `${fact.resolvedDate}T23:59:59.999Z` : fact.resolvedAt)
    .filter((value): value is string => Boolean(value));
  return values.sort()[0];
}

function isOverdue(value: string | undefined, now: Date): boolean {
  return Boolean(value && Number.isFinite(Date.parse(value)) && Date.parse(value) < now.getTime());
}

function itemSort(a: AttentionProjectionItem, b: AttentionProjectionItem): number {
  const overdue = Number(b.overdue) - Number(a.overdue);
  if (overdue !== 0) return overdue;
  const rank: Record<AttentionSurface, number> = {
    NEEDS_YOU: 0,
    REVIEW: 1,
    MANAGED: 2,
    LATER: 3,
    DONE: 4,
    NONE: 5
  };
  const surface = rank[a.surface] - rank[b.surface];
  if (surface !== 0) return surface;
  const time = (a.nearestRelevantTime ?? '\uffff').localeCompare(b.nearestRelevantTime ?? '\uffff');
  if (time !== 0) return time;
  return a.responsibilityId.localeCompare(b.responsibilityId);
}

/**
 * The conversation read model is derived from accepted Responsibility state.
 * It never treats message recency, trigger delivery, or notification delivery
 * as attention authority.
 */
export function projectConversationAttention(
  states: readonly ResponsibilityState[],
  options: {now?: Date; integrityTrusted?: boolean} = {}
): ConversationAttentionProjection {
  const now = options.now ?? new Date();
  const items = states
    .map((state) => {
      const projection = projectResponsibility(state);
      const nearestRelevantTime = temporalValue(state);
      return {
        responsibilityId: state.id,
        projection,
        surface: surfaceFor(projection),
        state,
        ...(nearestRelevantTime ? {nearestRelevantTime} : {}),
        overdue: isOverdue(nearestRelevantTime, now)
      } satisfies AttentionProjectionItem;
    })
    .sort(itemSort);
  const bySurface = (surface: AttentionSurface) => items.filter((item) => item.surface === surface);
  const needsYou = bySurface('NEEDS_YOU');
  const review = bySurface('REVIEW');
  const managed = bySurface('MANAGED');
  const later = bySurface('LATER');
  const done = bySurface('DONE');
  const none = bySurface('NONE');
  const visible = [...needsYou, ...review, ...managed, ...later, ...done];
  const primary = visible[0];
  return {
    conversationId: states.length > 0 ? states[0]?.conversationId : undefined,
    items,
    needsYou,
    managed,
    later,
    review,
    done,
    none,
    ...(primary ? {primaryResponsibilityId: primary.responsibilityId, primary} : {}),
    strictZero: options.integrityTrusted !== false && needsYou.length === 0 && review.length === 0,
    derivedAt: now.toISOString()
  };
}

function userAssertion(requestKey: string, conditionKey?: string): ProvenanceInput {
  return {
    evidenceKind: 'USER_ASSERTION',
    sourceLocator: {
      authorized: true,
      authorityReference: requestKey,
      ...(conditionKey ? {returnConditionKey: conditionKey} : {})
    }
  };
}

function attentionCommand(input: AttentionCommandInput, attentionMode: AttentionMode): TrustedResponsibilityCommand {
  const revision = input.evidenceRevision ?? input.state.acceptedEvidenceRevision;
  const provenance = userAssertion(input.requestKey, input.returnConditionKey);
  const patch: ResponsibilityPatch = {
    fieldChanges: [{
      fieldKey: 'attentionMode',
      value: attentionMode,
      authorityKind: 'USER_CORRECTION',
      provenance: [provenance]
    }]
  };
  return {
    userId: input.state.userId,
    connectedAccountId: input.state.connectedAccountId,
    conversationId: input.state.conversationId,
    commandSource: 'TRUSTED_USER',
    sourceEventKey: `attention:${input.state.id}:${input.requestKey}`,
    candidateKey: `attention:${input.state.id}:${input.requestKey}`,
    evidenceRevision: revision,
    admission: {decision: 'TRACK', reasonCodes: ['USER_ATTENTION_CONTROL']},
    provenance: [provenance],
    applicationKey: `attention:${input.state.id}:${input.requestKey}`,
    correlationId: input.requestKey,
    effects: [{
      operation: 'UPDATE',
      responsibilityRef: input.state.id,
      expectedAggregateVersion: input.state.aggregateVersion,
      effectKey: `attention:${attentionMode.toLowerCase()}`,
      patch,
      provenance: [provenance]
    }]
  };
}

/** Builds the accepted user effect that removes a Responsibility from LATER. */
export function createReturnAttentionCommand(input: AttentionCommandInput): TrustedResponsibilityCommand {
  if (input.state.resolutionStatus !== 'OPEN') throw new Error('Return Attention requires an open Responsibility');
  if (input.state.liveTrackingState !== 'TRACKING_ACTIVE') throw new Error('Return Attention requires active tracking');
  return attentionCommand(input, 'PRESENT');
}

/** Builds the accepted user effect used by the Temporal runtime for defer. */
export function createDeferAttentionCommand(input: AttentionCommandInput): TrustedResponsibilityCommand {
  if (input.state.resolutionStatus !== 'OPEN') throw new Error('defer requires an open Responsibility');
  if (input.state.liveTrackingState !== 'TRACKING_ACTIVE') throw new Error('defer requires active tracking');
  if (!input.returnConditionKey?.trim()) throw new Error('defer requires a durable return condition');
  return attentionCommand(input, 'DEFERRED');
}

/** Applies an attention command through the same reducer/currentness boundary as all other effects. */
export function applyAttentionCommand(
  state: ResponsibilityState,
  command: TrustedResponsibilityCommand,
  now = new Date()
): ResponsibilityState {
  const reference = command.provenance?.[0];
  const basis: ResponsibilityEvidenceBasis = {
    evidenceRevision: command.evidenceRevision,
    sourceEventKey: command.sourceEventKey,
    references: reference ? [reference] : []
  };
  const result = reduceResponsibility(command, {
    currentEvidenceRevision: command.evidenceRevision,
    existingResponsibilities: [state],
    evidenceBasis: basis,
    now
  });
  if (result.status !== 'APPLIED' || !result.effects[0]?.state) throw new Error(result.status === 'APPLIED' ? 'attention command did not produce state' : result.reason);
  return result.effects[0].state;
}

export function userActionableLeg(state: ResponsibilityState): ObligationLeg | undefined {
  return state.obligationLegs.find((leg) =>
    leg.bearer === 'USER' && leg.status === 'OPEN' && leg.actionability === 'ACTIONABLE' && leg.conditionSatisfied !== false
  );
}
