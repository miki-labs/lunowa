import type {SourceReadiness} from '@/lib/source-types';

import {projectConversationAttention} from './attention';
import type {AttentionProjectionItem} from './attention';
import type {AttentionItemReadModel, AttentionReadModel, AttentionSurface} from '@/lib/attention-types';
import {sourceReadinessAllowsHealthyMonitoring} from '@/server/integrity/projection';
import {projectAdmissionReview} from './projection';
import type {AdmissionReviewState, ResponsibilityState} from './types';

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
  const fact = state.temporalFacts
    .filter((candidate) =>
      candidate.currentnessStatus === 'ACCEPTED_CURRENT' &&
      (candidate.valueKind === 'DATE' || candidate.valueKind === 'INSTANT')
    )
    .sort((left, right) => {
      const leftValue = left.valueKind === 'DATE' ? left.resolvedDate : left.resolvedAt;
      const rightValue = right.valueKind === 'DATE' ? right.resolvedDate : right.resolvedAt;
      return (leftValue ?? '\uffff').localeCompare(rightValue ?? '\uffff');
    })[0];
  if (!fact) return awaitedEvent(state);
  return fact.originalExpression ?? fact.resolvedDate ?? fact.resolvedAt ?? null;
}

function reviewQuestion(state: ResponsibilityState): string | null {
  const uncertainty = state.details.uncertainties.find((candidate) => candidate.material && candidate.reviewRequired);
  return uncertainty?.reasonCode ?? null;
}

function summaryString(summary: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = summary[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function itemFromResponsibility(item: AttentionProjectionItem): AttentionItemReadModel {
  return {
    id: item.responsibilityId,
    subjectKind: 'RESPONSIBILITY',
    responsibilityId: item.responsibilityId,
    admissionReviewId: null,
    conversationId: item.state.conversationId,
    surface: surfaceFor(item.projection.bucket),
    projection: item.projection,
    operationalOutcome: item.state.operationalOutcome,
    reviewQuestion: item.projection.bucket === 'REVIEW' ? reviewQuestion(item.state) : null,
    primaryAction: primaryAction(item.state),
    awaitedEvent: awaitedEvent(item.state),
    returnCondition: returnCondition(item.state),
    nearestRelevantTime: item.nearestRelevantTime ?? null,
    overdue: item.overdue,
    connectedAccountId: item.state.connectedAccountId,
    acceptedEvidenceRevision: item.state.acceptedEvidenceRevision,
    aggregateVersion: item.state.aggregateVersion,
    liveTrackingState: item.state.liveTrackingState
  };
}

function itemFromAdmissionReview(review: AdmissionReviewState): AttentionItemReadModel {
  const projection = projectAdmissionReview();
  const question = summaryString(review.candidateSummary, ['question', 'reviewQuestion', 'prompt']);
  return {
    id: review.id,
    subjectKind: 'ADMISSION_REVIEW',
    responsibilityId: null,
    admissionReviewId: review.id,
    conversationId: review.conversationId,
    surface: 'REVIEW',
    projection,
    operationalOutcome: summaryString(review.candidateSummary, ['operationalOutcome', 'subject', 'topic']) ?? '責任を引き受けるか確認が必要です',
    reviewQuestion: question ?? `確認が必要です: ${review.reasonCodes.join('、')}`,
    primaryAction: null,
    awaitedEvent: null,
    returnCondition: null,
    nearestRelevantTime: null,
    overdue: false,
    connectedAccountId: review.connectedAccountId,
    acceptedEvidenceRevision: review.evidenceRevision,
    ...(review.aggregateVersion !== undefined ? {aggregateVersion: review.aggregateVersion} : {})
  };
}

export function buildAttentionReadModel(input: {
  responsibilities: readonly ResponsibilityState[];
  admissionReviews?: readonly AdmissionReviewState[];
  sourceReadiness: SourceReadiness;
  dataThroughAt: string | null;
  now?: Date;
}): AttentionReadModel {
  const now = input.now ?? new Date();
  const trustworthySource = sourceReadinessAllowsHealthyMonitoring(input.sourceReadiness);
  const projection = projectConversationAttention(input.responsibilities, {
    now,
    integrityTrusted: trustworthySource
  });
  const items = [
    ...projection.items.filter((item) => item.projection.subjectKind === 'RESPONSIBILITY').map(itemFromResponsibility),
    ...(input.admissionReviews ?? []).map(itemFromAdmissionReview)
  ];
  const bySurface = (surface: AttentionSurface) => items.filter((item) => item.surface === surface);
  const needsYou = bySurface('NEEDS_YOU');
  const managed = bySurface('MANAGED');
  const later = bySurface('LATER');
  const review = bySurface('REVIEW');
  const done = bySurface('DONE');
  const delegationCandidates = projection.none
    .filter((item) => item.state.resolutionStatus === 'OPEN' && item.state.liveTrackingState === 'HISTORICAL_INACTIVE')
    .map(itemFromResponsibility);
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
    delegationCandidates,
    strictZero: trustworthySource && integrity.status === 'healthy' && needsYou.length === 0 && review.length === 0 && later.length === 0,
    managedCount: trustworthySource && integrity.status === 'healthy' ? managed.length : 0,
    delegatedCount: managed.length + later.length + needsYou.length,
    derivedAt: now.toISOString()
  };
}
