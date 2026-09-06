import {describe, expect, it} from 'vitest';

import {
  InMemoryTemporalStore,
  TemporalRuntime,
  projectConversationAttention,
  projectResponsibility
} from '../src/server/responsibility';
import type {ObligationLeg, ResponsibilityState, TemporalEvidence} from '../src/server/responsibility';

const reference = {
  evidenceKind: 'PROVIDER_MESSAGE_OBSERVED' as const,
  messageId: 'message-1'
};

function leg(id: string, bearer: ObligationLeg['bearer']): ObligationLeg {
  return {
    id,
    bearer,
    actionCode: bearer === 'USER' ? 'FOLLOW_UP' : 'WAIT_FOR_REPLY',
    status: 'OPEN',
    actionability: bearer === 'USER' ? 'ACTIONABLE' : 'BLOCKED',
    basisKind: 'COMMUNICATED_REQUEST',
    provenance: [reference]
  };
}

function state(overrides: Partial<ResponsibilityState> = {}): ResponsibilityState {
  return {
    id: 'responsibility-1',
    userId: 'user-1',
    connectedAccountId: 'account-1',
    conversationId: 'conversation-1',
    operationalOutcome: 'obtain the requested result',
    resolutionStatus: 'OPEN',
    liveTrackingState: 'TRACKING_ACTIVE',
    attentionMode: 'PRESENT',
    acceptedEvidenceRevision: 1,
    aggregateVersion: 1,
    obligationLegs: [leg('other-leg', 'OTHER_PARTY')],
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
    provenance: [reference],
    resolutionHistory: [],
    ...overrides
  };
}

function contractInput(now: Date, triggerType: 'TIME' | 'REPLY_RECEIVED' | 'DEADLINE' = 'TIME') {
  return {
    userId: 'user-1',
    connectedAccountId: 'account-1',
    responsibilityId: 'responsibility-1',
    contractKind: 'PASSIVE_WAITING' as const,
    createdBy: 'USER',
    returnCondition: {
      kind: triggerType,
      ...(triggerType === 'REPLY_RECEIVED' ? {expectedEventId: 'reply-1'} : {label: 'reconsider'})
    },
    triggers: [{
      id: `${triggerType.toLowerCase()}-trigger`,
      triggerType,
      ...(triggerType === 'TIME' ? {triggerAt: new Date(now.getTime() + 1000).toISOString()} : {})
    }],
    now
  };
}

describe('G32 attention and Temporal runtime', () => {
  it('projects Waiting as Managed and does not fabricate Needs You on Return Attention', async () => {
    const initial = state({attentionMode: 'DEFERRED'});
    const store = new InMemoryTemporalStore();
    store.setResponsibility(initial);
    const runtime = new TemporalRuntime(store);
    const returned = runtime.returnAttention({responsibilityId: initial.id, requestKey: 'inspect-1'});
    expect(returned.attentionMode).toBe('PRESENT');
    expect(projectResponsibility(returned).bucket).toBe('WAITING');
    expect(projectConversationAttention([returned]).needsYou).toHaveLength(0);
    expect(projectConversationAttention([returned]).managed).toHaveLength(1);
  });

  it('persists defer intent, survives snapshot/restart, and fires only after current evidence says attention is needed', async () => {
    const now = new Date('2026-09-06T00:00:00.000Z');
    const initial = state();
    const evidence: TemporalEvidence = {evidenceRevision: 1, references: [reference], userAttentionNeeded: true};
    const firstStore = new InMemoryTemporalStore();
    firstStore.setResponsibility(initial);
    firstStore.setEvidence(initial.id, evidence);
    const firstRuntime = new TemporalRuntime(firstStore);
    const deferred = await firstRuntime.deferAttention({state: initial, requestKey: 'defer-1', contract: {
      ...contractInput(now),
      triggers: [{id: 'return-trigger', triggerType: 'TIME', triggerAt: now.toISOString()}]
    }});
    expect(deferred.state.attentionMode).toBe('DEFERRED');
    expect(projectResponsibility(deferred.state).bucket).toBe('LATER');

    const restarted = new InMemoryTemporalStore(firstStore.snapshot());
    const result = await new TemporalRuntime(restarted).processTemporalTrigger('return-trigger', now);
    expect(result.status).toBe('FIRED');
    expect(result.state?.attentionMode).toBe('PRESENT');
    expect(result.projection?.bucket).toBe('WAITING');
    expect((await new TemporalRuntime(restarted).processTemporalTrigger('return-trigger', now)).status).toBe('ALREADY_PROCESSED');
  });

  it('turns an old contract version into an audited no-op and never resurrects it', async () => {
    const now = new Date('2026-09-06T00:00:00.000Z');
    const store = new InMemoryTemporalStore();
    const initial = state({attentionMode: 'DEFERRED'});
    store.setResponsibility(initial);
    store.setEvidence(initial.id, {evidenceRevision: 1, references: [reference], userAttentionNeeded: true});
    const runtime = new TemporalRuntime(store);
    await runtime.deferAttention({state: initial, requestKey: 'defer-1', contract: {...contractInput(now), triggers: [{id: 'old-trigger', triggerType: 'TIME', triggerAt: now.toISOString()}]}});
    store.upsertContract({...contractInput(now), triggers: [{id: 'new-trigger', triggerType: 'TIME', triggerAt: now.toISOString()}]});
    const result = await runtime.processTemporalTrigger('old-trigger', now);
    expect(result.status).toBe('STALE');
    expect(store.getResponsibility(initial.id)?.attentionMode).toBe('DEFERRED');
    expect(store.listAudits()).toEqual(expect.arrayContaining([expect.objectContaining({outcome: 'STALE', triggerId: 'old-trigger'})]));
  });

  it('rechecks the contract after an evaluator yields', async () => {
    const now = new Date('2026-09-06T00:00:00.000Z');
    const store = new InMemoryTemporalStore();
    const initial = state({attentionMode: 'DEFERRED'});
    store.setResponsibility(initial);
    store.setEvidence(initial.id, {evidenceRevision: 1, references: [reference], userAttentionNeeded: true});
    store.upsertContract({...contractInput(now), triggers: [{id: 'yielded-trigger', triggerType: 'TIME', triggerAt: now.toISOString()}]});
    const runtime = new TemporalRuntime(store, {
      evaluate: async () => {
        store.upsertContract({...contractInput(now), triggers: [{id: 'replacement-trigger', triggerType: 'TIME', triggerAt: now.toISOString()}]});
        return {kind: 'RETURN_ATTENTION', reasonCode: 'SHOULD_NOT_APPLY'};
      }
    });
    const result = await runtime.processTemporalTrigger('yielded-trigger', now);
    expect(result.status).toBe('STALE');
    expect(store.getResponsibility(initial.id)?.attentionMode).toBe('DEFERRED');
  });

  it('treats a deadline trigger as a currentness check, not as automatic Needs You', async () => {
    const now = new Date('2026-09-06T00:00:00.000Z');
    const store = new InMemoryTemporalStore();
    const initial = state({attentionMode: 'DEFERRED'});
    store.setResponsibility(initial);
    store.setEvidence(initial.id, {evidenceRevision: 1, references: [reference], deadlineReached: true, userAttentionNeeded: true});
    store.upsertContract({...contractInput(now, 'DEADLINE'), triggers: [{id: 'deadline-trigger', triggerType: 'DEADLINE'}]});
    const result = await new TemporalRuntime(store).processTemporalTrigger('deadline-trigger', now);
    expect(result.status).toBe('FIRED');
    expect(result.projection?.bucket).toBe('WAITING');
    expect(result.state?.attentionMode).toBe('PRESENT');
  });

  it('keeps a reply with no current user work quiet and separates notification failure from domain integrity', async () => {
    const now = new Date('2026-09-06T00:00:00.000Z');
    const store = new InMemoryTemporalStore();
    const initial = state({attentionMode: 'DEFERRED'});
    store.setResponsibility(initial);
    store.setEvidence(initial.id, {evidenceRevision: 1, references: [reference], replyReceived: true, userAttentionNeeded: false});
    const runtime = new TemporalRuntime(store);
    const contract = store.upsertContract({...contractInput(now, 'REPLY_RECEIVED'), triggers: [{id: 'reply-trigger', triggerType: 'REPLY_RECEIVED'}]});
    const quiet = await runtime.processTemporalTrigger('reply-trigger', now);
    expect(quiet.status).toBe('NO_OP');
    expect(store.getResponsibility(initial.id)?.attentionMode).toBe('DEFERRED');
    expect(contract.status).toBe('ACTIVE');

    const notifyStore = new InMemoryTemporalStore();
    const notifyState = state({attentionMode: 'DEFERRED'});
    notifyStore.setResponsibility(notifyState);
    notifyStore.setEvidence(notifyState.id, {evidenceRevision: 1, references: [reference], replyReceived: true, userAttentionNeeded: true});
    notifyStore.upsertContract({...contractInput(now, 'REPLY_RECEIVED'), triggers: [{id: 'notify-trigger', triggerType: 'REPLY_RECEIVED'}]});
    const notificationRuntime = new TemporalRuntime(notifyStore, {notify: () => { throw new Error('delivery unavailable'); }});
    const deliveredDomain = await notificationRuntime.processTemporalTrigger('notify-trigger', now);
    expect(deliveredDomain.status).toBe('FIRED');
    expect(deliveredDomain.notificationStatus).toBe('FAILED');
    expect(notifyStore.getTrigger('notify-trigger')?.status).toBe('FIRED');
    expect(notifyStore.listAudits()).toEqual(expect.arrayContaining([expect.objectContaining({outcome: 'NOTIFICATION_FAILED'})]));
  });

  it('reconciles an abandoned claimed trigger after a restart', async () => {
    const claimedAt = new Date('2026-09-06T00:00:00.000Z');
    const now = new Date('2026-09-06T00:10:00.000Z');
    const store = new InMemoryTemporalStore();
    const initial = state({attentionMode: 'DEFERRED'});
    store.setResponsibility(initial);
    store.setEvidence(initial.id, {evidenceRevision: 1, references: [reference], userAttentionNeeded: true});
    const contract = store.upsertContract({...contractInput(claimedAt), triggers: [{id: 'crashed-trigger', triggerType: 'TIME', triggerAt: claimedAt.toISOString()}]});
    expect(contract.status).toBe('ACTIVE');
    const claimed = store.claimTrigger('crashed-trigger', claimedAt, 60_000);
    expect(claimed?.status).toBe('CLAIMED');
    const restarted = new InMemoryTemporalStore(store.snapshot());
    const results = await new TemporalRuntime(restarted, {claimLeaseMs: 60_000}).reconcileOverdue(now);
    expect(results[0]?.status).toBe('FIRED');
    expect(restarted.getTrigger('crashed-trigger')?.status).toBe('FIRED');
  });

  it('allows only one live claimant for duplicate trigger delivery', async () => {
    const now = new Date('2026-09-06T00:00:00.000Z');
    const store = new InMemoryTemporalStore();
    const initial = state({attentionMode: 'DEFERRED'});
    store.setResponsibility(initial);
    store.setEvidence(initial.id, {evidenceRevision: 1, references: [reference], userAttentionNeeded: true});
    store.upsertContract({...contractInput(now), triggers: [{id: 'duplicate-trigger', triggerType: 'TIME', triggerAt: now.toISOString()}]});
    let evaluations = 0;
    const runtime = new TemporalRuntime(store, {evaluate: async () => {
      evaluations += 1;
      await Promise.resolve();
      return {kind: 'RETURN_ATTENTION', reasonCode: 'CURRENT_USER_ATTENTION_REQUIRED'};
    }});
    const results = await Promise.all([
      runtime.processTemporalTrigger('duplicate-trigger', now),
      runtime.processTemporalTrigger('duplicate-trigger', now)
    ]);
    expect(evaluations).toBe(1);
    expect(results.filter((result) => result.status === 'FIRED')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'NOT_DUE')).toHaveLength(1);
  });
});
