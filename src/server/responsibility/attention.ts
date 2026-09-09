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
  TemporalFact,
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
  expectedAggregateVersion?: number;
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

type RelevantTemporalValue = {value: string; fact: TemporalFact};

function temporalValue(state: ResponsibilityState): RelevantTemporalValue | undefined {
  return state.temporalFacts
    .filter((fact) => fact.currentnessStatus === 'ACCEPTED_CURRENT' && (fact.valueKind === 'DATE' || fact.valueKind === 'INSTANT'))
    .map((fact) => ({
      fact,
      // DATE is deliberately kept as a calendar date. Converting it to an
      // arbitrary UTC end-of-day instant would invent precision/reference
      // frame that the accepted temporal fact does not contain.
      value: fact.valueKind === 'DATE' ? fact.resolvedDate : fact.resolvedAt
    }))
    .filter((item): item is RelevantTemporalValue => Boolean(item.value))
    .sort((left, right) => left.value.localeCompare(right.value))[0];
}

function calendarDateAt(now: Date, timeZone: string): string | undefined {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(now);
    const value = (type: 'year' | 'month' | 'day') => parts.find((part) => part.type === type)?.value;
    const year = value('year');
    const month = value('month');
    const day = value('day');
    return year && month && day ? `${year}-${month}-${day}` : undefined;
  } catch {
    // Unknown/non-IANA reference frames must not be guessed into a timezone.
    return undefined;
  }
}

function isOverdue(value: RelevantTemporalValue | undefined, now: Date): boolean {
  if (!value) return false;
  if (value.fact.valueKind === 'INSTANT') {
    const instant = value.fact.resolvedAt ? Date.parse(value.fact.resolvedAt) : Number.NaN;
    return Number.isFinite(instant) && instant < now.getTime();
  }
  if (!value.fact.resolvedDate || !value.fact.referenceTimezone) return false;
  const currentDate = calendarDateAt(now, value.fact.referenceTimezone);
  return Boolean(currentDate && currentDate > value.fact.resolvedDate);
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
      const nearestTemporal = temporalValue(state);
      const nearestRelevantTime = nearestTemporal?.value;
      return {
        responsibilityId: state.id,
        projection,
        surface: surfaceFor(projection),
        state,
        ...(nearestRelevantTime ? {nearestRelevantTime} : {}),
        overdue: isOverdue(nearestTemporal, now)
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
      expectedAggregateVersion: input.expectedAggregateVersion ?? input.state.aggregateVersion,
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

function trustedUserCommandBase(input: AttentionCommandInput, action: string): Pick<TrustedResponsibilityCommand, 'userId' | 'connectedAccountId' | 'conversationId' | 'commandSource' | 'sourceEventKey' | 'candidateKey' | 'evidenceRevision' | 'admission' | 'provenance' | 'applicationKey' | 'correlationId'> {
  const provenance = userAssertion(input.requestKey);
  return {
    userId: input.state.userId,
    connectedAccountId: input.state.connectedAccountId,
    conversationId: input.state.conversationId,
    commandSource: 'TRUSTED_USER',
    sourceEventKey: `trusted-attention:${action}:${input.state.id}:${input.requestKey}`,
    candidateKey: `trusted-attention:${action}:${input.state.id}:${input.requestKey}`,
    evidenceRevision: input.evidenceRevision ?? input.state.acceptedEvidenceRevision,
    admission: {decision: 'TRACK', reasonCodes: [`USER_${action}`]},
    provenance: [provenance],
    applicationKey: `trusted-attention:${action}:${input.state.id}:${input.requestKey}`,
    correlationId: input.requestKey
  };
}

/** Stops monitoring without asserting that the operational outcome was satisfied. */
export function createStopTrackingCommand(input: AttentionCommandInput): TrustedResponsibilityCommand {
  if (input.state.resolutionStatus !== 'OPEN') throw new Error('Stop Tracking requires an open Responsibility');
  if (input.state.liveTrackingState !== 'TRACKING_ACTIVE') throw new Error('Stop Tracking requires active tracking');
  const provenance = userAssertion(input.requestKey);
  return {
    ...trustedUserCommandBase(input, 'STOP_TRACKING'),
    effects: [{
      operation: 'RESOLVE',
      responsibilityRef: input.state.id,
      expectedAggregateVersion: input.expectedAggregateVersion ?? input.state.aggregateVersion,
      effectKey: 'stop-tracking',
      reason: 'USER_CLOSED',
      resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['USER_ASSERTION']},
      patch: {fieldChanges: [{
        fieldKey: 'liveTrackingState',
        value: 'HISTORICAL_INACTIVE',
        authorityKind: 'USER_CORRECTION',
        provenance: [provenance]
      }]},
      provenance: [provenance]
    }]
  };
}

/** Stops monitoring because the user intentionally disconnected the owning mailbox.
 * The operational Responsibility stays OPEN and may only become active again
 * through the explicit delegation action. */
export function createDisconnectTrackingCommand(input: AttentionCommandInput): TrustedResponsibilityCommand {
  if (input.state.resolutionStatus !== 'OPEN') throw new Error('account disconnect requires an open Responsibility');
  if (input.state.liveTrackingState !== 'TRACKING_ACTIVE') throw new Error('account disconnect requires active tracking');
  const provenance = userAssertion(input.requestKey);
  return {
    ...trustedUserCommandBase(input, 'DISCONNECT_ACCOUNT'),
    effects: [{
      operation: 'UPDATE',
      responsibilityRef: input.state.id,
      expectedAggregateVersion: input.expectedAggregateVersion ?? input.state.aggregateVersion,
      effectKey: 'disconnect-account-stop-tracking',
      patch: {fieldChanges: [
        {fieldKey: 'liveTrackingState', value: 'HISTORICAL_INACTIVE', authorityKind: 'USER_CORRECTION', provenance: [provenance]},
        {fieldKey: 'attentionMode', value: 'PRESENT', authorityKind: 'USER_CORRECTION', provenance: [provenance]}
      ]},
      provenance: [provenance]
    }]
  };
}

/** Explicitly activates one already accepted historical Responsibility. */
export function createDelegateResponsibilityCommand(input: AttentionCommandInput): TrustedResponsibilityCommand {
  if (input.state.resolutionStatus !== 'OPEN') throw new Error('delegation requires an open Responsibility');
  if (input.state.liveTrackingState !== 'HISTORICAL_INACTIVE') throw new Error('delegation requires an inactive accepted Responsibility');
  const provenance = userAssertion(input.requestKey);
  return {
    ...trustedUserCommandBase(input, 'DELEGATE'),
    effects: [{
      operation: 'UPDATE',
      responsibilityRef: input.state.id,
      expectedAggregateVersion: input.expectedAggregateVersion ?? input.state.aggregateVersion,
      effectKey: 'delegate-responsibility',
      patch: {fieldChanges: [
        {fieldKey: 'liveTrackingState', value: 'TRACKING_ACTIVE', authorityKind: 'USER_CORRECTION', provenance: [provenance]},
        {fieldKey: 'attentionMode', value: 'PRESENT', authorityKind: 'USER_CORRECTION', provenance: [provenance]}
      ]},
      provenance: [provenance]
    }]
  };
}

/** Applies the one supported state-level review correction without resolving a review by UI convention. */
export function createOperationalOutcomeCorrectionCommand(input: AttentionCommandInput & {value: string}): TrustedResponsibilityCommand {
  if (input.state.resolutionStatus !== 'OPEN') throw new Error('field correction requires an open Responsibility');
  if (!input.value.trim()) throw new Error('operationalOutcome correction must be non-empty');
  const provenance = userAssertion(input.requestKey);
  return {
    ...trustedUserCommandBase(input, 'CORRECT_OPERATIONAL_OUTCOME'),
    effects: [{
      operation: 'UPDATE',
      responsibilityRef: input.state.id,
      expectedAggregateVersion: input.expectedAggregateVersion ?? input.state.aggregateVersion,
      effectKey: 'correct-operational-outcome',
      patch: {fieldChanges: [{
        fieldKey: 'operationalOutcome',
        value: input.value.trim(),
        authorityKind: 'USER_CORRECTION',
        relation: 'CORRECTION',
        provenance: [provenance]
      }]},
      provenance: [provenance]
    }]
  };
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
