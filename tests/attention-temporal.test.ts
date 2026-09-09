import {describe, expect, it} from 'vitest';

import {
  InMemoryTemporalStore,
  TemporalRuntime,
  applyAttentionCommand,
  createDelegateResponsibilityCommand,
  createDisconnectTrackingCommand,
  createOperationalOutcomeCorrectionCommand,
  createStopTrackingCommand,
  projectConversationAttention,
  projectResponsibility,
  reduceResponsibility
} from '../src/server/responsibility';
import type {ObligationLeg, ResponsibilityState, TemporalEvidence, TrustedResponsibilityCommand} from '../src/server/responsibility';

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
  it('closes tracking as USER_CLOSED without claiming SATISFIED completion', () => {
    const initial = state({obligationLegs: [leg('user-leg', 'USER')]});
    const stopped = applyAttentionCommand(initial, createStopTrackingCommand({
      state: initial,
      requestKey: 'stop-1',
      evidenceRevision: 1,
      expectedAggregateVersion: 1
    }), new Date('2026-09-06T00:00:00.000Z'));

    expect(stopped).toMatchObject({
      conversationId: initial.conversationId,
      resolutionStatus: 'RESOLVED',
      resolutionReason: 'USER_CLOSED',
      liveTrackingState: 'HISTORICAL_INACTIVE',
      attentionMode: 'PRESENT'
    });
    expect(stopped.resolutionReason).not.toBe('SATISFIED');
    expect(stopped.obligationLegs[0]).toMatchObject({status: 'CLOSED', closureReason: 'USER_CLOSED'});
    expect(projectResponsibility(stopped).bucket).toBe('NONE');
  });

  it('disconnects tracking without resolving the operational Responsibility and requires explicit delegation to reactivate it', () => {
    const initial = state({attentionMode: 'DEFERRED'});
    const disconnected = applyAttentionCommand(initial, createDisconnectTrackingCommand({
      state: initial,
      requestKey: 'disconnect-account-1',
      evidenceRevision: 1,
      expectedAggregateVersion: 1
    }), new Date('2026-09-09T00:00:00.000Z'));

    expect(disconnected).toMatchObject({
      resolutionStatus: 'OPEN',
      liveTrackingState: 'HISTORICAL_INACTIVE',
      attentionMode: 'PRESENT'
    });
    expect(disconnected.resolutionReason).toBeUndefined();
    expect(projectResponsibility(disconnected).bucket).toBe('NONE');

    const explicitlyDelegated = applyAttentionCommand(disconnected, createDelegateResponsibilityCommand({
      state: disconnected,
      requestKey: 'delegate-after-reconnect',
      evidenceRevision: 1,
      expectedAggregateVersion: 2
    }));
    expect(explicitlyDelegated.liveTrackingState).toBe('TRACKING_ACTIVE');
  });

  it('requires explicit currentness for delegation and correction of an inactive accepted loop', () => {
    const inactive = state({liveTrackingState: 'HISTORICAL_INACTIVE'});
    const delegated = applyAttentionCommand(inactive, createDelegateResponsibilityCommand({
      state: inactive,
      requestKey: 'delegate-1',
      evidenceRevision: 1,
      expectedAggregateVersion: 1
    }));
    expect(delegated.liveTrackingState).toBe('TRACKING_ACTIVE');
    expect(projectResponsibility(delegated).bucket).toBe('WAITING');

    const corrected = applyAttentionCommand(delegated, createOperationalOutcomeCorrectionCommand({
      state: delegated,
      requestKey: 'correct-1',
      evidenceRevision: 1,
      expectedAggregateVersion: 2,
      value: 'updated operational outcome'
    }));
    expect(corrected.operationalOutcome).toBe('updated operational outcome');
  });

  it('rejects stale evidence and aggregate versions before an attention action can mutate accepted state', () => {
    const inactive = state({liveTrackingState: 'HISTORICAL_INACTIVE'});
    const staleEvidence = createDelegateResponsibilityCommand({
      state: inactive,
      requestKey: 'delegate-stale-evidence',
      evidenceRevision: 1,
      expectedAggregateVersion: 1
    });
    const stale = reduceResponsibility(staleEvidence, {
      currentEvidenceRevision: 2,
      existingResponsibilities: [inactive]
    });
    expect(stale.status).toBe('STALE');
    expect(stale.responsibilities[0]).toEqual(inactive);

    expect(() => applyAttentionCommand(inactive, createDelegateResponsibilityCommand({
      state: inactive,
      requestKey: 'delegate-stale-aggregate',
      evidenceRevision: 1,
      expectedAggregateVersion: 0
    }))).toThrow(/changed after interpretation/);
  });

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

  it('preserves DATE precision and only marks it overdue in an explicit valid reference timezone', () => {
    const dated = state({
      temporalFacts: [{
        id: 'date-due',
        temporalKind: 'SOURCE_DUE',
        originalExpression: '1月2日まで',
        valueKind: 'DATE',
        resolvedDate: '2030-01-02',
        precisionCode: 'DATE',
        referenceTimezone: 'Asia/Tokyo',
        currentnessStatus: 'ACCEPTED_CURRENT',
        provenance: [reference]
      }]
    });
    const beforeLocalMidnight = projectConversationAttention([dated], {now: new Date('2030-01-02T14:59:59.999Z')}).items[0];
    expect(beforeLocalMidnight?.nearestRelevantTime).toBe('2030-01-02');
    expect(beforeLocalMidnight?.overdue).toBe(false);

    const afterLocalMidnight = projectConversationAttention([dated], {now: new Date('2030-01-02T15:00:00.000Z')}).items[0];
    expect(afterLocalMidnight?.overdue).toBe(true);

    const unknownReferenceFrame = state({
      id: 'unknown-date-frame',
      temporalFacts: [{...dated.temporalFacts[0]!, referenceTimezone: undefined}]
    });
    const unknown = projectConversationAttention([unknownReferenceFrame], {now: new Date('2030-01-03T12:00:00.000Z')}).items[0];
    expect(unknown?.nearestRelevantTime).toBe('2030-01-02');
    expect(unknown?.overdue).toBe(false);
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
      triggers: [
        {id: 'return-trigger', triggerType: 'TIME', triggerAt: now.toISOString()},
        {id: 'sibling-trigger', triggerType: 'TIME', triggerAt: now.toISOString()}
      ]
    }});
    expect(deferred.state.attentionMode).toBe('DEFERRED');
    expect(projectResponsibility(deferred.state).bucket).toBe('LATER');
    const repeated = await firstRuntime.deferAttention({state: initial, requestKey: 'defer-1', contract: {
      ...contractInput(now),
      triggers: [
        {id: 'return-trigger', triggerType: 'TIME', triggerAt: now.toISOString()},
        {id: 'sibling-trigger', triggerType: 'TIME', triggerAt: now.toISOString()}
      ]
    }});
    expect(repeated.contract.id).toBe(deferred.contract.id);
    expect(repeated.state.aggregateVersion).toBe(deferred.state.aggregateVersion);
    expect(firstStore.listTriggers()).toHaveLength(2);

    const restarted = new InMemoryTemporalStore(firstStore.snapshot());
    const result = await new TemporalRuntime(restarted).processTemporalTrigger('return-trigger', now);
    expect(result.status).toBe('FIRED');
    expect(result.state?.attentionMode).toBe('PRESENT');
    expect(result.projection?.bucket).toBe('WAITING');
    expect(restarted.getContract(deferred.contract.id)?.status).toBe('RESOLVED');
    expect(restarted.getTrigger('sibling-trigger')?.status).toBe('CANCELLED');
    expect((await new TemporalRuntime(restarted).processTemporalTrigger('return-trigger', now)).status).toBe('ALREADY_PROCESSED');
    const completedReplay = await new TemporalRuntime(restarted).deferAttention({state: initial, requestKey: 'defer-1', contract: {
      ...contractInput(now),
      triggers: [
        {id: 'return-trigger', triggerType: 'TIME', triggerAt: now.toISOString()},
        {id: 'sibling-trigger', triggerType: 'TIME', triggerAt: now.toISOString()}
      ]
    }});
    expect(completedReplay.contract.status).toBe('RESOLVED');
    expect(completedReplay.state.attentionMode).toBe('PRESENT');
    expect(restarted.getTrigger('sibling-trigger')?.status).toBe('CANCELLED');
  });

  it('keeps contract versions monotonic after resolution and replays a replacement request idempotently', async () => {
    const now = new Date('2026-09-06T00:00:00.000Z');
    const store = new InMemoryTemporalStore();
    const initial = state();
    store.setResponsibility(initial);
    const runtime = new TemporalRuntime(store);
    const first = await runtime.deferAttention({
      state: initial,
      requestKey: 'version-first',
      contract: {...contractInput(now), id: 'contract-request-1', triggers: [{id: 'version-trigger-1', triggerType: 'TIME', triggerAt: now.toISOString()}]}
    });
    runtime.returnAttention({responsibilityId: initial.id, requestKey: 'version-return', now});
    const secondInput = {...contractInput(now), id: 'contract-request-2', triggers: [{id: 'version-trigger-2', triggerType: 'TIME' as const, triggerAt: now.toISOString()}]};
    const second = await runtime.deferAttention({state: initial, requestKey: 'version-second', contract: secondInput});
    expect(second.contract.version).toBe(first.contract.version + 1);
    expect(second.contract.id).toBe('contract-request-2');
    const replay = await runtime.deferAttention({state: initial, requestKey: 'version-second', contract: secondInput});
    expect(replay.contract.id).toBe(second.contract.id);
    expect(replay.contract.version).toBe(second.contract.version);
    expect(store.listTriggers().filter((trigger) => trigger.temporalContractId === second.contract.id)).toHaveLength(1);
  });

  it('turns an old contract version into an audited no-op and never resurrects it', async () => {
    const now = new Date('2026-09-06T00:00:00.000Z');
    const store = new InMemoryTemporalStore();
    const initial = state({attentionMode: 'DEFERRED'});
    store.setResponsibility(initial);
    store.setEvidence(initial.id, {evidenceRevision: 1, references: [reference], userAttentionNeeded: true});
    const runtime = new TemporalRuntime(store);
    await runtime.deferAttention({state: initial, requestKey: 'defer-1', contract: {...contractInput(now), triggers: [{id: 'old-trigger', triggerType: 'TIME', triggerAt: now.toISOString()}]}});
    const replacement = store.upsertContract({...contractInput(now), triggers: [{id: 'new-trigger', triggerType: 'TIME', triggerAt: now.toISOString()}]});
    expect(store.getTrigger('new-trigger')?.temporalContractId).toBe(replacement.id);
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

  it('implements T04 as one same-Responsibility follow-up transition and retires the consumed contract', async () => {
    const now = new Date('2026-09-06T00:00:00.000Z');
    const store = new InMemoryTemporalStore();
    const initial = state();
    store.setResponsibility(initial);
    store.setEvidence(initial.id, {evidenceRevision: 1, references: [reference], userAttentionNeeded: true});
    const contract = store.upsertContract({...contractInput(now), triggers: [
      {id: 'follow-up-trigger', triggerType: 'TIME', triggerAt: now.toISOString()},
      {id: 'follow-up-sibling', triggerType: 'TIME', triggerAt: now.toISOString()}
    ]});
    const runtime = new TemporalRuntime(store, {evaluate: () => ({
      kind: 'APPLY',
      reasonCode: 'FOLLOW_UP_DUE',
      patch: {obligationLegs: [leg('follow-up-leg', 'USER')]}
    })});
    const result = await runtime.processTemporalTrigger('follow-up-trigger', now);
    expect(result.status).toBe('FIRED');
    expect(result.state?.id).toBe(initial.id);
    expect(result.state?.obligationLegs.map(({id}) => id)).toEqual(expect.arrayContaining(['other-leg', 'follow-up-leg']));
    expect(result.projection?.bucket).toBe('MY_TURN');
    expect(store.getContract(contract.id)?.status).toBe('RESOLVED');
    expect(store.getTrigger('follow-up-sibling')?.status).toBe('CANCELLED');
  });

  it('rejects a Temporal APPLY command that tries to mutate another Responsibility in the same conversation', async () => {
    const now = new Date('2026-09-06T00:00:00.000Z');
    const store = new InMemoryTemporalStore();
    const initial = state();
    const other = state({id: 'responsibility-2', operationalOutcome: 'unrelated outcome'});
    store.setResponsibility(initial);
    store.setResponsibility(other);
    store.setEvidence(initial.id, {evidenceRevision: 1, references: [reference], userAttentionNeeded: true});
    store.upsertContract({...contractInput(now), triggers: [{id: 'cross-scope-trigger', triggerType: 'TIME', triggerAt: now.toISOString()}]});
    const crossScope: TrustedResponsibilityCommand = {
      commandSource: 'TRUSTED_SYSTEM',
      userId: initial.userId,
      connectedAccountId: initial.connectedAccountId,
      conversationId: initial.conversationId,
      sourceEventKey: 'cross-scope-temporal',
      candidateKey: 'cross-scope-temporal',
      applicationKey: 'cross-scope-temporal',
      evidenceRevision: 1,
      admission: {decision: 'TRACK', reasonCodes: ['TEMPORAL_RECONSIDERATION']},
      provenance: [reference],
      effects: [{
        operation: 'UPDATE',
        responsibilityRef: other.id,
        expectedAggregateVersion: other.aggregateVersion,
        effectKey: 'cross-scope-update',
        patch: {operationalOutcome: 'incorrectly changed'},
        provenance: [reference]
      }]
    };
    const result = await new TemporalRuntime(store, {evaluate: () => ({kind: 'APPLY', reasonCode: 'CROSS_SCOPE', command: crossScope})})
      .processTemporalTrigger('cross-scope-trigger', now);
    expect(result.status).toBe('FAILED');
    expect(result.error).toMatch(/claimed Responsibility/);
    expect(store.getResponsibility(other.id)?.operationalOutcome).toBe('unrelated outcome');
  });

  it('does not let Temporal APPLY hide work or change live tracking', async () => {
    const now = new Date('2026-09-06T00:00:00.000Z');
    const store = new InMemoryTemporalStore();
    const initial = state();
    store.setResponsibility(initial);
    store.setEvidence(initial.id, {evidenceRevision: 1, references: [reference], userAttentionNeeded: true});
    store.upsertContract({...contractInput(now), triggers: [{id: 'auto-hide-trigger', triggerType: 'TIME', triggerAt: now.toISOString()}]});
    const result = await new TemporalRuntime(store, {evaluate: () => ({
      kind: 'APPLY',
      reasonCode: 'AUTO_HIDE_ATTEMPT',
      patch: {attentionMode: 'DEFERRED'}
    })}).processTemporalTrigger('auto-hide-trigger', now);
    expect(result.status).toBe('FAILED');
    expect(result.error).toMatch(/cannot defer attention or change live tracking/);
    expect(store.getResponsibility(initial.id)?.attentionMode).toBe('PRESENT');
    expect(store.getResponsibility(initial.id)?.liveTrackingState).toBe('TRACKING_ACTIVE');
  });

  it('confines Return Attention to attention even if an evaluator supplies a command', async () => {
    const now = new Date('2026-09-06T00:00:00.000Z');
    const initial = state({attentionMode: 'DEFERRED'});
    const store = new InMemoryTemporalStore();
    store.setResponsibility(initial);
    store.setEvidence(initial.id, {evidenceRevision: 1, references: [reference], userAttentionNeeded: true});
    store.upsertContract({...contractInput(now), triggers: [{id: 'bounded-return-trigger', triggerType: 'TIME', triggerAt: now.toISOString()}]});
    const attemptedWorldStateCommand: TrustedResponsibilityCommand = {
      commandSource: 'TRUSTED_SYSTEM',
      userId: initial.userId,
      connectedAccountId: initial.connectedAccountId,
      conversationId: initial.conversationId,
      sourceEventKey: 'attempted-world-state-return',
      candidateKey: 'attempted-world-state-return',
      evidenceRevision: 1,
      admission: {decision: 'TRACK', reasonCodes: ['TEMPORAL_RECONSIDERATION']},
      effects: [{
        operation: 'UPDATE',
        responsibilityRef: initial.id,
        effectKey: 'attempted-world-state-return',
        patch: {fieldChanges: [{fieldKey: 'operationalOutcome', value: 'fabricated by return', authorityKind: 'EXTERNAL_AUTHORITATIVE_FACT'}]}
      }]
    };
    const runtime = new TemporalRuntime(store, {evaluate: () => ({
      kind: 'RETURN_ATTENTION',
      reasonCode: 'CURRENT_USER_ATTENTION_REQUIRED',
      command: attemptedWorldStateCommand
    })});
    const result = await runtime.processTemporalTrigger('bounded-return-trigger', now);
    expect(result.status).toBe('FIRED');
    expect(result.state?.attentionMode).toBe('PRESENT');
    expect(result.state?.operationalOutcome).toBe(initial.operationalOutcome);
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
    expect(store.getTrigger('reply-trigger')?.status).toBe('FIRED');
    expect(store.listAudits()).toEqual(expect.arrayContaining([expect.objectContaining({outcome: 'NO_OP', triggerId: 'reply-trigger'})]));

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
