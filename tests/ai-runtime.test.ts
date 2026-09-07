import {describe, expect, it} from 'vitest';
import OpenAI from 'openai';

import {
  AIContractError,
  DRAFT_RESPONSE_FORMAT,
  INTERPRETATION_RESPONSE_FORMAT,
  InMemoryAIRunStore,
  ResponsibilityInterpretationRuntime,
  ContextualDraftRuntime,
  assertFamilyStratifiedHoldout,
  assertExecutableFixtureStratification,
  checkInterpretationOracle,
  G70_EVAL_CASES,
  OpenAISdkResponsesTransport,
  buildInterpretationContext,
  type AuthorizedInterpretationContext,
  type AuthorizedReplyContext,
  type ModelInterpretationOutput,
  type ResponsesRequest,
  type ResponsesTransport,
  validateInterpretationOutput
} from '@/server/ai';

const messageId = 'message-1';
const participantId = '00000000-0000-4000-8000-000000000010';
const messageBody = '修正版を明日までに送ってください。';
const sourceRef = {messageId, zone: 'AUTHORED_CURRENT' as const, excerpt: messageBody, start: 0, end: messageBody.length};

function interpretationOutput(overrides: Partial<ModelInterpretationOutput> = {}): ModelInterpretationOutput {
  return {
    schemaVersion: 1,
    basisEvidenceRevision: 1,
    status: 'CANDIDATE',
    sourceMessageId: messageId,
    semanticUnits: [{
      candidateUnitKey: 'unit-1',
      materiality: 'MATERIAL',
      operationalOutcome: 'send the revised document',
      obligationLegs: [{id: 'leg-1', bearerCandidate: 'USER', actionCode: 'SEND_REVISED_DOCUMENT', blockedByCondition: false, sourceRefs: [sourceRef]}],
      expectedEvents: [], temporalFacts: [{id: 'due-1', temporalKind: 'SOURCE_DUE', valueKind: 'DATE', resolvedDate: '2026-08-25', precisionCode: 'DATE', conflictCandidate: false, sourceRefs: [sourceRef]}],
      completionCriteria: [], constraints: [], pendingProposals: [], agreedFacts: [], uncertainties: [], riskDetails: [], corrections: [], sourceRefs: [sourceRef]
    }],
    sourceRefs: [sourceRef],
    ...overrides
  };
}

function interpretationContext(): AuthorizedInterpretationContext {
  return {
    user: {id: 'user-1', email: 'user@example.com', locale: 'ja-JP', timezone: 'Asia/Tokyo'},
    connectedAccount: {id: 'account-1', provider: 'gmail', emailAddress: 'user@example.com'},
    conversationId: 'conversation-1', sourceEventKey: 'message-1-revision-1', evidenceRevision: 1, focalMessageId: messageId,
    participantIds: [participantId],
    messages: [{
      id: messageId, direction: 'INBOUND', sender: {email: 'partner@example.com', displayName: 'Partner'}, recipients: [{email: 'user@example.com'}],
      subject: '修正版', body: messageBody, sentAt: '2026-08-24T09:00:00+09:00', sourceZones: [{zone: 'AUTHORED_CURRENT', start: 0, end: messageBody.length}]
    }]
  };
}

function replyContext(): AuthorizedReplyContext {
  return {
    user: {id: 'user-1', email: 'user@example.com', locale: 'ja-JP', timezone: 'Asia/Tokyo'},
    connectedAccount: {id: 'account-1', provider: 'gmail', emailAddress: 'user@example.com'},
    conversationId: 'conversation-1', evidenceRevision: 1, replyMode: 'REPLY', trustedRecipientLabels: ['Partner <partner@example.com>'],
    message: {id: messageId, direction: 'INBOUND', sender: {email: 'partner@example.com', displayName: 'Partner'}, recipients: [{email: 'user@example.com'}], subject: '確認', body: 'ご確認をお願いします。', sentAt: '2026-08-24T09:00:00+09:00'}
  };
}

class FakeTransport implements ResponsesTransport {
  public readonly kind = 'test' as const;
  public readonly requests: ResponsesRequest[] = [];
  public constructor(private readonly response: unknown) {}
  public async create(request: ResponsesRequest): Promise<unknown> {
    this.requests.push(request);
    return this.response;
  }
}

function response(value: unknown): unknown {
  return {status: 'completed', output_text: JSON.stringify(value)};
}

const config = {model: 'gpt-5.6', modelConfigVersion: 'g70-test-v1', dataControlMode: 'UNVERIFIED' as const};
const currentEvidenceRevision = () => 1;

describe('G70 bounded AI runtime', () => {
  it('publishes strict, separate Structured Outputs contracts', () => {
    expect(INTERPRETATION_RESPONSE_FORMAT.strict).toBe(true);
    expect(DRAFT_RESPONSE_FORMAT.strict).toBe(true);
    expect(INTERPRETATION_RESPONSE_FORMAT.schema.additionalProperties).toBe(false);
    expect(DRAFT_RESPONSE_FORMAT.schema.additionalProperties).toBe(false);
    expect(INTERPRETATION_RESPONSE_FORMAT.name).not.toBe(DRAFT_RESPONSE_FORMAT.name);
    expect(JSON.stringify(INTERPRETATION_RESPONSE_FORMAT.schema)).not.toContain('"additionalProperties":true');
  });

  it('captures a run and returns a candidate through the trusted derivation boundary', async () => {
    const transport = new FakeTransport(response(interpretationOutput()));
    const store = new InMemoryAIRunStore();
    const result = await new ResponsibilityInterpretationRuntime({transport, runStore: store, config, currentEvidenceRevision}).run(interpretationContext());

    expect(result.status).toBe('CANDIDATE');
    if (result.status !== 'CANDIDATE') return;
    expect(result.derivation.status).toBe('DERIVED');
    if (result.derivation.status === 'DERIVED') expect(result.derivation.command.admission.decision).toBe('TRACK');
    expect(store.runs.get(result.runId)?.status).toBe('SUCCEEDED');
    expect(store.runs.get(result.runId)?.contextManifest).toMatchObject({dataControlMode: 'UNVERIFIED', storageRequest: 'store:false'});
    expect(transport.requests[0]?.store).toBe(false);
    expect(transport.requests[0]?.text.format.name).toBe(INTERPRETATION_RESPONSE_FORMAT.name);
    expect(JSON.stringify(transport.requests[0])).toContain('untrusted_source');
  });

  it('keeps successful No Responsibility distinct from model abstention', async () => {
    const noResponsibility = interpretationOutput({semanticUnits: []});
    const noResponsibilityResult = await new ResponsibilityInterpretationRuntime({transport: new FakeTransport(response(noResponsibility)), runStore: new InMemoryAIRunStore(), config, currentEvidenceRevision}).run(interpretationContext());
    expect(noResponsibilityResult.status).toBe('NO_RESPONSIBILITY');

    const abstained = interpretationOutput({status: 'ABSTAINED', abstentionReason: 'AMBIGUOUS', semanticUnits: []});
    const abstainedResult = await new ResponsibilityInterpretationRuntime({transport: new FakeTransport(response(abstained)), runStore: new InMemoryAIRunStore(), config, currentEvidenceRevision}).run(interpretationContext());
    expect(abstainedResult.status).toBe('ABSTAINED');
  });

  it('rejects model authority injection and does not create a domain effect', async () => {
    const injected = {...interpretationOutput(), effects: [{operation: 'RESOLVE'}]} as unknown;
    const result = await new ResponsibilityInterpretationRuntime({transport: new FakeTransport(response(injected)), runStore: new InMemoryAIRunStore(), config, currentEvidenceRevision}).run(interpretationContext());
    expect(result.status).toBe('FAILED');
    if (result.status === 'FAILED') expect(result.reason).toContain('outside the model authority');
  });

  it('rejects stale evidence before candidate derivation', async () => {
    const store = new InMemoryAIRunStore();
    const result = await new ResponsibilityInterpretationRuntime({transport: new FakeTransport(response(interpretationOutput())), runStore: store, config, currentEvidenceRevision: () => 2}).run(interpretationContext());
    expect(result.status).toBe('STALE');
    expect(store.runs.get(result.runId)?.status).toBe('STALE');
  });

  it('keeps contextual draft output editable and preserves manual fallback', async () => {
    const store = new InMemoryAIRunStore();
    const transport = new FakeTransport(response({schemaVersion: 1, basisEvidenceRevision: 1, status: 'DRAFT', body: '確認しました。明日までにお送りします。', abstentionReason: null}));
    const result = await new ContextualDraftRuntime({transport, runStore: store, config, currentEvidenceRevision}).run(replyContext());
    expect(result.status).toBe('DRAFT');
    if (result.status !== 'DRAFT') return;
    expect(result.body).toContain('確認しました');
    expect(result.manualFallbackAvailable).toBe(true);
    expect(transport.requests[0]?.store).toBe(false);
    expect(transport.requests[0]?.text.format.name).toBe(DRAFT_RESPONSE_FORMAT.name);
  });

  it('degrades draft assistance without blocking manual composition', async () => {
    const store = new InMemoryAIRunStore();
    const transport: ResponsesTransport = {kind: 'test', create: async () => {throw new Error('provider unavailable');}};
    const result = await new ContextualDraftRuntime({transport, runStore: store, config, currentEvidenceRevision}).run(replyContext());
    expect(result.status).toBe('FAILED');
    expect(result.manualFallbackAvailable).toBe(true);
  });

  it('uses the official SDK Responses adapter with explicit store:false and no tools', async () => {
    const requests: RequestInit[] = [];
    const client = new OpenAI({
      apiKey: 'test-key',
      maxRetries: 0,
      dangerouslyAllowBrowser: true,
      fetch: async (_input, init) => {
        requests.push(init ?? {});
        return new Response(JSON.stringify(response(interpretationOutput())), {headers: {'content-type': 'application/json'}});
      }
    });
    const transport = new OpenAISdkResponsesTransport({client});
    await transport.create({
      model: 'gpt-5.6',
      input: [{role: 'user', content: [{type: 'input_text', text: 'fixture'}]}],
      store: false,
      max_output_tokens: 100,
      text: {format: INTERPRETATION_RESPONSE_FORMAT}
    });
    const body = JSON.parse(String(requests[0]?.body)) as Record<string, unknown>;
    expect(body.store).toBe(false);
    expect(body.tools).toBeUndefined();
    expect(body.text).toEqual({format: INTERPRETATION_RESPONSE_FORMAT});
  });

  it('fails closed for UNVERIFIED production data control before any provider call', async () => {
    const store = new InMemoryAIRunStore();
    let calls = 0;
    const transport: ResponsesTransport = {
      kind: 'official',
      create: async () => {
        calls += 1;
        return response(interpretationOutput());
      }
    };
    const context = interpretationContext();
    const built = buildInterpretationContext(context);
    const run = await store.capture({
      lane: 'interpretation', schemaVersion: built.manifest.schemaVersion, userId: context.user.id,
      connectedAccountId: context.connectedAccount.id, conversationId: context.conversationId,
      messageIds: built.manifest.messageIds, sourceMessageId: context.focalMessageId,
      basisEvidenceRevision: built.manifest.basisEvidenceRevision, modelConfigVersion: config.modelConfigVersion,
      providerModelIdentifier: config.model, contextManifest: built.manifest
    });
    const snapshot = {
      captureInterpretation: async () => ({context, built, runId: run.id}),
      captureDraft: async () => { throw new Error('not used'); }
    };
    const result = await new ResponsibilityInterpretationRuntime({transport, runStore: store, contextSnapshot: snapshot, config, currentEvidenceRevision}).run({
      userId: context.user.id, connectedAccountId: context.connectedAccount.id, conversationId: context.conversationId,
      sourceEventKey: context.sourceEventKey, focalMessageId: context.focalMessageId, messageIds: [messageId]
    });
    expect(result.status).toBe('FAILED');
    expect(calls).toBe(0);
    expect(store.runs.get(run.id)?.status).toBe('FAILED');
  });

  it('keeps one captured revision/message manifest when evidence arrives during the model call', async () => {
    const context = interpretationContext();
    const built = buildInterpretationContext(context);
    const store = new InMemoryAIRunStore();
    let evidenceArrived = false;
    const snapshot = {
      captureInterpretation: async () => {
        const run = await store.capture({
          lane: 'interpretation', schemaVersion: built.manifest.schemaVersion, userId: context.user.id,
          connectedAccountId: context.connectedAccount.id, conversationId: context.conversationId,
          messageIds: built.manifest.messageIds, sourceMessageId: context.focalMessageId,
          basisEvidenceRevision: built.manifest.basisEvidenceRevision, modelConfigVersion: config.modelConfigVersion,
          providerModelIdentifier: config.model, contextManifest: {...built.manifest, snapshotConsistency: 'REPEATABLE_READ'}
        });
        return {context, built, runId: run.id};
      },
      captureDraft: async () => { throw new Error('not used'); }
    };
    const transport = new FakeTransport(response(interpretationOutput()));
    const originalCreate = transport.create.bind(transport);
    transport.create = async (request) => {
      const result = await originalCreate(request);
      evidenceArrived = true;
      return result;
    };
    const result = await new ResponsibilityInterpretationRuntime({
      transport, runStore: store, contextSnapshot: snapshot, config,
      currentEvidenceRevision: () => evidenceArrived ? 2 : 1
    }).run({
      userId: context.user.id, connectedAccountId: context.connectedAccount.id, conversationId: context.conversationId,
      sourceEventKey: context.sourceEventKey, focalMessageId: context.focalMessageId, messageIds: [messageId]
    });
    expect(result.status).toBe('STALE');
    if (result.status !== 'STALE') return;
    const captured = store.runs.get(result.runId);
    expect(captured?.basisEvidenceRevision).toBe(1);
    expect(captured?.contextManifest).toMatchObject({messageIds: [messageId], basisEvidenceRevision: 1, snapshotConsistency: 'REPEATABLE_READ'});
  });

  it('uses a family-stratified holdout and passes layer-owned oracle checks', () => {
    expect(() => assertFamilyStratifiedHoldout()).not.toThrow();
    const check = checkInterpretationOracle('T0-001', interpretationOutput());
    expect(check.passed).toBe(true);
    expect(G70_EVAL_CASES.filter((item) => item.split === 'HOLDOUT').length).toBeGreaterThan(0);
  });

  it('executes separated holdout fixtures through schema, runtime, and canonical oracles', async () => {
    const fixtures = [
      {id: 'T0-001', family: 'direction-request', lane: 'interpretation' as const, split: 'DEVELOPMENT' as const},
      {id: 'T0-037', family: 'high-risk-authority', lane: 'interpretation' as const, split: 'HOLDOUT' as const},
      {id: 'T0-040', family: 'genuine-ambiguity', lane: 'interpretation' as const, split: 'HOLDOUT' as const},
      {id: 'PG-50', family: 'prompt-injection', lane: 'interpretation' as const, split: 'HOLDOUT' as const},
      {id: 'PG-22', family: 'ai-degradation', lane: 'interpretation' as const, split: 'HOLDOUT' as const},
      {id: 'PG-60', family: 'no-responsibility', lane: 'interpretation' as const, split: 'HOLDOUT' as const},
      {id: 'PG-29', family: 'draft-fallback', lane: 'draft' as const, split: 'DEVELOPMENT' as const},
      {id: 'PG-42', family: 'draft-japanese-business', lane: 'draft' as const, split: 'DEVELOPMENT' as const},
      {id: 'PG-45', family: 'draft-high-risk', lane: 'draft' as const, split: 'HOLDOUT' as const},
      {id: 'PG-52', family: 'draft-context-boundary', lane: 'draft' as const, split: 'HOLDOUT' as const}
    ];
    expect(() => assertExecutableFixtureStratification(fixtures)).not.toThrow();

    const highRisk = interpretationOutput({semanticUnits: [{
      ...interpretationOutput().semanticUnits[0]!,
      riskDetails: [{id: 'risk-1', targetKind: 'source', riskClass: 'HIGH', reasonCode: 'PROMPT_INJECTION', sourceRefs: [sourceRef]}]
    }]});
    const cases = [
      {id: 'T0-001', output: interpretationOutput(), expected: 'CANDIDATE' as const},
      {id: 'T0-037', output: highRisk, expected: 'CANDIDATE' as const},
      {id: 'PG-50', output: highRisk, expected: 'CANDIDATE' as const},
      {id: 'T0-040', output: interpretationOutput({status: 'ABSTAINED', abstentionReason: 'AMBIGUOUS', semanticUnits: []}), expected: 'ABSTAINED' as const},
      {id: 'PG-60', output: interpretationOutput({semanticUnits: []}), expected: 'NO_RESPONSIBILITY' as const}
    ];
    for (const fixture of cases) {
      const result = await new ResponsibilityInterpretationRuntime({
        transport: new FakeTransport(response(fixture.output)), runStore: new InMemoryAIRunStore(), config, currentEvidenceRevision
      }).run(interpretationContext());
      expect(result.status, fixture.id).toBe(fixture.expected);
      expect(checkInterpretationOracle(fixture.id, fixture.output).passed, fixture.id).toBe(true);
    }

    const degraded = interpretationOutput({status: 'ABSTAINED', abstentionReason: 'UNINTERPRETABLE', semanticUnits: []});
    const stale = await new ResponsibilityInterpretationRuntime({
      transport: new FakeTransport(response(degraded)), runStore: new InMemoryAIRunStore(), config, currentEvidenceRevision: () => 2
    }).run(interpretationContext());
    expect(stale.status).toBe('STALE');
    expect(checkInterpretationOracle('PG-22', degraded).passed).toBe(true);

    const japaneseDraft = await new ContextualDraftRuntime({
      transport: new FakeTransport(response({schemaVersion: 1, basisEvidenceRevision: 1, status: 'DRAFT', body: 'ご確認ありがとうございます。明日までにお送りします。', abstentionReason: null})),
      runStore: new InMemoryAIRunStore(), config, currentEvidenceRevision
    }).run(replyContext());
    expect(japaneseDraft.status).toBe('DRAFT');
    if (japaneseDraft.status === 'DRAFT') expect(japaneseDraft.body).toContain('お送りします');

    const providerFallback = await new ContextualDraftRuntime({
      transport: {kind: 'test', create: async () => {throw new Error('provider unavailable');}},
      runStore: new InMemoryAIRunStore(), config, currentEvidenceRevision
    }).run(replyContext());
    expect(providerFallback.status).toBe('FAILED');
    expect(providerFallback.manualFallbackAvailable).toBe(true);

    const draftFallback = await new ContextualDraftRuntime({
      transport: new FakeTransport(response({schemaVersion: 1, basisEvidenceRevision: 1, status: 'ABSTAINED', body: '', abstentionReason: 'UNSAFE_HIGH_RISK'})),
      runStore: new InMemoryAIRunStore(), config, currentEvidenceRevision
    }).run(replyContext());
    expect(draftFallback.status).toBe('ABSTAINED');
    expect(draftFallback.manualFallbackAvailable).toBe(true);

    const boundaryViolation = await new ContextualDraftRuntime({
      transport: new FakeTransport(response({schemaVersion: 1, basisEvidenceRevision: 1, status: 'DRAFT', body: 'ok', abstentionReason: null, recipient: 'attacker'})),
      runStore: new InMemoryAIRunStore(), config, currentEvidenceRevision
    }).run(replyContext());
    expect(boundaryViolation.status).toBe('FAILED');
    expect(boundaryViolation.manualFallbackAvailable).toBe(true);
  });

  it('rejects unauthorized source IDs and trusted authority fields outside the candidate contract', () => {
    const validationInput = {
      basisEvidenceRevision: 1,
      allowedMessageIds: new Set([messageId]),
      allowedParticipantIds: new Set([participantId]),
      allowedSourceZones: new Map([[messageId, [{zone: 'AUTHORED_CURRENT' as const, start: 0, end: messageBody.length}]]]),
      authorizedMessageBodies: new Map([[messageId, messageBody]])
    };
    expect(() => validateInterpretationOutput({...interpretationOutput(), sourceRefs: [{...sourceRef, messageId: 'other-message'}]}, validationInput)).toThrow(AIContractError);
    expect(() => validateInterpretationOutput({...interpretationOutput(), sender: 'attacker'}, validationInput)).toThrow('outside the model authority');
    expect(() => validateInterpretationOutput({...interpretationOutput(), sourceRefs: [{...sourceRef, zone: 'QUOTED_HISTORY'}]}, validationInput)).toThrow('unauthorized source zone');
  });
});
