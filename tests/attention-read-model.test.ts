import {describe, expect, it} from 'vitest';

import {buildAttentionReadModel} from '@/server/responsibility/attention-read-model';
import type {AdmissionReviewState, ObligationLeg, ResponsibilityState} from '@/server/responsibility';

const evidence = {evidenceKind: 'PROVIDER_MESSAGE_OBSERVED', messageId: 'message-1'} as const;

const admissionReview: AdmissionReviewState = {
  id: 'admission-review-1',
  userId: 'user-1',
  connectedAccountId: 'account-1',
  conversationId: 'conversation-2',
  sourceEventKey: 'message-2',
  candidateKey: 'candidate-2',
  evidenceRevision: 2,
  reasonCodes: ['RESPONSIBILITY_EXISTENCE_AMBIGUOUS'],
  candidateSummary: {question: 'この依頼を引き受けますか？', subject: '契約更新'},
  status: 'OPEN'
};

function state(overrides: Partial<ResponsibilityState> = {}): ResponsibilityState {
  const userLeg: ObligationLeg = {
    id: 'user-action',
    bearer: 'USER',
    actionCode: 'REPLY',
    actionSummary: '返信する',
    status: 'OPEN',
    actionability: 'ACTIONABLE',
    basisKind: 'COMMUNICATED_REQUEST',
    provenance: [evidence]
  };
  return {
    id: 'responsibility-1',
    userId: 'user-1',
    connectedAccountId: 'account-1',
    conversationId: 'conversation-1',
    operationalOutcome: '見積書の確認を終える',
    resolutionStatus: 'OPEN',
    liveTrackingState: 'TRACKING_ACTIVE',
    attentionMode: 'PRESENT',
    acceptedEvidenceRevision: 1,
    aggregateVersion: 1,
    obligationLegs: [userLeg],
    expectedEvents: [],
    temporalFacts: [],
    details: {
      completionCriteria: [],
      constraints: [],
      pendingProposals: [],
      agreedFacts: [],
      uncertainties: [],
      riskDetails: []
    },
    fieldDecisions: [],
    provenance: [evidence],
    resolutionHistory: [],
    ...overrides
  };
}

describe('G40 attention read model', () => {
  it('keeps actionable work, managed work, and strict zero derived from accepted state', () => {
    const model = buildAttentionReadModel({
      responsibilities: [
        state(),
        state({id: 'responsibility-2', obligationLegs: [{...state().obligationLegs[0]!, id: 'waiting', actionability: 'BLOCKED', bearer: 'OTHER_PARTY'}]})
      ],
      sourceReadiness: 'ready',
      dataThroughAt: '2030-01-01T00:00:00.000Z',
      now: new Date('2030-01-01T00:00:00.000Z')
    });

    expect(model.needsYou).toHaveLength(1);
    expect(model.needsYou[0]).toMatchObject({operationalOutcome: '見積書の確認を終える', primaryAction: '返信する'});
    expect(model.managed).toHaveLength(1);
    expect(model.managedCount).toBe(1);
    expect(model.strictZero).toBe(false);
  });

  it('never presents strict zero or healthy Managed reassurance for incomplete Source coverage', () => {
    const model = buildAttentionReadModel({
      responsibilities: [state({obligationLegs: [{...state().obligationLegs[0]!, actionability: 'BLOCKED', bearer: 'OTHER_PARTY'}]})],
      sourceReadiness: 'partial',
      dataThroughAt: null,
      now: new Date('2030-01-01T00:00:00.000Z')
    });

    expect(model.strictZero).toBe(false);
    expect(model.managedCount).toBe(0);
    expect(model.integrity.status).toBe('unknown');
  });

  it('keeps an open admission review visible and out of healthy Managed/strict zero', () => {
    const model = buildAttentionReadModel({
      responsibilities: [],
      admissionReviews: [admissionReview],
      sourceReadiness: 'ready',
      dataThroughAt: '2030-01-01T00:00:00.000Z',
      now: new Date('2030-01-01T00:00:00.000Z')
    });

    expect(model.review).toHaveLength(1);
    expect(model.review[0]).toMatchObject({
      id: 'admission-review-1',
      subjectKind: 'ADMISSION_REVIEW',
      responsibilityId: null,
      admissionReviewId: 'admission-review-1',
      reviewQuestion: 'この依頼を引き受けますか？'
    });
    expect(model.managedCount).toBe(0);
    expect(model.strictZero).toBe(false);
  });

  it('keeps an inactive accepted Responsibility available only as an explicit delegation candidate', () => {
    const model = buildAttentionReadModel({
      responsibilities: [state({liveTrackingState: 'HISTORICAL_INACTIVE'})],
      sourceReadiness: 'ready',
      dataThroughAt: '2030-01-01T00:00:00.000Z',
      now: new Date('2030-01-01T00:00:00.000Z')
    });

    expect(model.needsYou).toHaveLength(0);
    expect(model.managed).toHaveLength(0);
    expect(model.delegationCandidates ?? []).toHaveLength(1);
    expect(model.delegationCandidates?.[0]).toMatchObject({
      id: 'responsibility-1',
      surface: 'NONE',
      projection: {bucket: 'NONE', subjectKind: 'NONE'},
      liveTrackingState: 'HISTORICAL_INACTIVE'
    });
  });

  it('keeps LATER inspectable and distinct from no monitoring', () => {
    const model = buildAttentionReadModel({
      responsibilities: [state({attentionMode: 'DEFERRED'})],
      sourceReadiness: 'ready',
      dataThroughAt: '2030-01-01T00:00:00.000Z',
      now: new Date('2030-01-01T00:00:00.000Z')
    });

    expect(model.managedCount).toBe(0);
    expect(model.later).toHaveLength(1);
    expect(model.strictZero).toBe(false);
    expect(model.later[0]?.projection.bucket).toBe('LATER');
  });
});
