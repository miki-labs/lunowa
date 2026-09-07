import {beforeEach, describe, expect, it, vi} from 'vitest';

const mocks = vi.hoisted(() => ({
  getOwnedAppSession: vi.fn(),
  sessionAccessResponse: vi.fn(),
  responsibilityRepository: {
    getResponsibility: vi.fn(),
    applyTrustedCommand: vi.fn(),
    resolveAdmissionReview: vi.fn()
  },
  temporalRepository: {returnAttention: vi.fn()}
}));

vi.mock('@/server/auth/session', () => ({
  getOwnedAppSession: mocks.getOwnedAppSession,
  sessionAccessResponse: mocks.sessionAccessResponse
}));
vi.mock('@/server/db/repositories/responsibility', () => ({
  ResponsibilityRepository: vi.fn(function () { return mocks.responsibilityRepository; })
}));
vi.mock('@/server/db/repositories/temporal', () => ({
  TemporalRepository: vi.fn(function () { return mocks.temporalRepository; })
}));

import {POST} from '@/app/api/bff/users/[userId]/attention/actions/route';
import type {ResponsibilityState} from '@/server/responsibility';

const userAssertion = {evidenceKind: 'USER_ASSERTION' as const, sourceLocator: {authorized: true, authorityReference: 'test-request'}};
const acceptedState: ResponsibilityState = {
  id: '11111111-1111-4111-8111-111111111111', userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', connectedAccountId: '22222222-2222-4222-8222-222222222222', conversationId: '33333333-3333-4333-8333-333333333333',
  operationalOutcome: 'wait for the counterpart', resolutionStatus: 'OPEN', liveTrackingState: 'TRACKING_ACTIVE', attentionMode: 'PRESENT',
  acceptedEvidenceRevision: 4, aggregateVersion: 6, obligationLegs: [], expectedEvents: [], temporalFacts: [],
  details: {completionCriteria: [], constraints: [], pendingProposals: [], agreedFacts: [], uncertainties: [], riskDetails: []},
  fieldDecisions: [], provenance: [userAssertion], resolutionHistory: []
};

function request(body: Record<string, unknown>) {
  return new Request('http://localhost/api/bff/users/user-1/attention/actions', {
    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
  });
}

const stopBody = {
  action: 'STOP_TRACKING', connectedAccountId: '22222222-2222-4222-8222-222222222222', responsibilityId: '11111111-1111-4111-8111-111111111111',
  requestKey: '44444444-4444-4444-8444-444444444444', evidenceRevision: 4, expectedAggregateVersion: 6
};

describe('authenticated attention action boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getOwnedAppSession.mockResolvedValue({user: {id: 'user-1'}});
    mocks.sessionAccessResponse.mockReturnValue(null);
    mocks.responsibilityRepository.getResponsibility.mockResolvedValue({state: acceptedState, projection: {bucket: 'WAITING', subjectKind: 'RESPONSIBILITY', primaryReason: 'waiting'}});
    mocks.responsibilityRepository.applyTrustedCommand.mockResolvedValue({status: 'APPLIED', admission: 'TRACK', effects: [], responsibilities: [acceptedState]});
  });

  it('uses the trusted Stop Tracking command with evidence and aggregate currentness', async () => {
    const response = await POST(request(stopBody), {params: Promise.resolve({userId: 'user-1'})});

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({accepted: true, action: 'STOP_TRACKING'});
    const [command] = mocks.responsibilityRepository.applyTrustedCommand.mock.calls[0] as [{effects: [{operation: string; reason: string; expectedAggregateVersion: number}]; evidenceRevision: number; commandSource: string; sourceEventKey: string; applicationKey: string}];
    expect(command).toMatchObject({commandSource: 'TRUSTED_USER', evidenceRevision: 4});
    expect(command.effects[0]).toMatchObject({operation: 'RESOLVE', reason: 'USER_CLOSED', expectedAggregateVersion: 6});
    expect(stopBody.requestKey.length).toBeLessThanOrEqual(48);
    expect(command.sourceEventKey.length).toBeLessThanOrEqual(128);
    expect(command.applicationKey.length).toBeLessThanOrEqual(128);
  });

  it('turns a stale trusted command into failure and does not report accepted state', async () => {
    mocks.responsibilityRepository.applyTrustedCommand.mockResolvedValue({status: 'STALE', admission: 'TRACK', reason: 'candidate basis revision is not current', effects: [], responsibilities: [acceptedState]});

    const response = await POST(request(stopBody), {params: Promise.resolve({userId: 'user-1'})});

    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({accepted: false});
  });

  it('keeps Review resolution on its explicit DO_NOT_TRACK path with currentness', async () => {
    mocks.responsibilityRepository.resolveAdmissionReview.mockResolvedValue(undefined);
    const response = await POST(request({
      action: 'RESOLVE_ADMISSION_REVIEW', admissionReviewId: '55555555-5555-4555-8555-555555555555', connectedAccountId: '22222222-2222-4222-8222-222222222222',
      requestKey: '66666666-6666-4666-8666-666666666666', resolution: 'DO_NOT_TRACK', evidenceRevision: 4, expectedAggregateVersion: 2
    }), {params: Promise.resolve({userId: 'user-1'})});

    expect(response.status).toBe(200);
    expect(mocks.responsibilityRepository.resolveAdmissionReview).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user-1', reviewId: '55555555-5555-4555-8555-555555555555', resolution: 'DO_NOT_TRACK', evidenceRevision: 4, expectedAggregateVersion: 2
    }));
  });

  it('rejects unsupported TRACK review resolution before calling the resolver', async () => {
    const response = await POST(request({
      action: 'RESOLVE_ADMISSION_REVIEW', admissionReviewId: '55555555-5555-4555-8555-555555555555', connectedAccountId: '22222222-2222-4222-8222-222222222222',
      requestKey: '77777777-7777-4777-8777-777777777777', resolution: 'TRACK', evidenceRevision: 4, expectedAggregateVersion: 2
    }), {params: Promise.resolve({userId: 'user-1'})});

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({accepted: false});
    expect(mocks.responsibilityRepository.resolveAdmissionReview).not.toHaveBeenCalled();
  });
});
