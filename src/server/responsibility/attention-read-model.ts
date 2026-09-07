import type {SourceReadiness} from '@/lib/source-types';

import {projectConversationAttention} from './attention';
import type {AttentionProjectionItem} from './attention';
import type {AttentionItemReadModel, AttentionReadModel, AttentionSurface} from '@/lib/attention-types';
import type {ResponsibilityState} from './types';

function surfaceFor(bucket: AttentionProjectionItem['projection']['bucket']): AttentionSurface {
  switch (bucket) {
    case 'MY_TURN': return 'NEEDS_YOU';
    case 'WAITING': return 'MANAGED';
    default: return bucket;
  }
}

function primaryAction(state: ResponsibilityState): string | null {
  const leg = state.obligationLegs.find((candidate) =>
    candidate.bearer === 'USER' &&
    candidate.status === 'OPEN' &&
    candidate.actionability === 'ACTIONABLE' &&
    candidate.conditionSatisfied !== false
  );
  return leg?.actionSummary ?? leg?.actionCode ?? null;
}

function awaitedEvent(state: ResponsibilityState): string | null {
  const event = state.expectedEvents.find((candidate) => candidate.status === 'PENDING');
  return event?.eventSummary ?? event?.eventCode ?? null;
}

function returnCondition(state: ResponsibilityState): string | null {
  const fact = state.temporalFacts.find((candidate) =>
    candidate.currentnessStatus === 'ACCEPTED_CURRENT' &&
    (candidate.valueKind === 'DATE' || candidate.valueKind === 'INSTANT')
  );
  if (!fact) return awaitedEvent(state);
  return fact.originalExpression ?? fact.resolvedDate ?? fact.resolvedAt ?? null;
}

function itemFrom(
  item: AttentionProjectionItem
): AttentionItemReadModel {
  return {
    responsibilityId: item.responsibilityId,
    conversationId: item.state.conversationId,
    surface: surfaceFor(item.projection.bucket),
    projection: item.projection,
    operationalOutcome: item.state.operationalOutcome,
    primaryAction: primaryAction(item.state),
    awaitedEvent: awaitedEvent(item.state),
    returnCondition: returnCondition(item.state),
    nearestRelevantTime: item.nearestRelevantTime ?? null,
    overdue: item.overdue
  };
}

export function buildAttentionReadModel(input: {
  responsibilities: readonly ResponsibilityState[];
  sourceReadiness: SourceReadiness;
  dataThroughAt: string | null;
  now?: Date;
}): AttentionReadModel {
  const now = input.now ?? new Date();
  const trustworthySource = input.sourceReadiness === 'ready';
  const projection = projectConversationAttention(input.responsibilities, {
    now,
    integrityTrusted: trustworthySource
  });
  const items = projection.items.map(itemFrom);
  const bySurface = (surface: AttentionSurface) => items.filter((item) => item.surface === surface);
  const needsYou = bySurface('NEEDS_YOU');
  const managed = bySurface('MANAGED');
  const later = bySurface('LATER');
  const review = bySurface('REVIEW');
  const done = bySurface('DONE');
  const integrity: AttentionReadModel['integrity'] = input.sourceReadiness === 'degraded'
    ? {status: 'degraded', message: 'Sourceの確認範囲に問題があります。管理中の安心表示を保留しています。'}
    : trustworthySource
      ? {status: 'healthy', message: null}
      : {status: 'unknown', message: 'Sourceの確認範囲がまだ十分ではありません。対応なしとは表示しません。'};

  return {
    source: {readiness: input.sourceReadiness, dataThroughAt: input.dataThroughAt},
    integrity,
    needsYou,
    managed,
    later,
    review,
    done,
    strictZero: trustworthySource && integrity.status === 'healthy' && needsYou.length === 0 && review.length === 0,
    managedCount: trustworthySource && integrity.status === 'healthy' ? managed.length : 0,
    delegatedCount: managed.length + later.length + needsYou.length + review.length,
    derivedAt: now.toISOString()
  };
}
