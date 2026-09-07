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
  checkInterpretationOracle,
  G70_EVAL_CASES,
  OpenAISdkResponsesTransport,
  buildDraftContext,
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

function sourceRefFor(body: string) {
  return {messageId, participantId: null, zone: 'AUTHORED_CURRENT' as const, excerpt: body, start: 0, end: body.length};
}

const sourceRef = sourceRefFor(messageBody);

function interpretationOutput(overrides: Partial<ModelInterpretationOutput> = {}, ref = sourceRef): ModelInterpretationOutput {
  return {
    schemaVersion: 3,
    basisEvidenceRevision: 1,
    status: 'CANDIDATE',
    sourceMessageId: messageId,
    semanticUnits: [{
      candidateUnitKey: 'unit-1',
      materiality: 'MATERIAL',
      operationalOutcome: 'send the revised document',
      obligationLegs: [{id: 'leg-1', bearerCandidate: 'USER', actionCode: 'SEND_REVISED_DOCUMENT', basisKind: 'COMMUNICATED_REQUEST', blockedByCondition: false, sourceRefs: [ref]}],
      expectedEvents: [], temporalFacts: [{id: 'due-1', temporalKind: 'SOURCE_DUE', originalExpression: '明日', valueKind: 'DATE', resolvedDate: '2026-08-25', precisionCode: 'DATE', conflictCandidate: false, sourceRefs: [ref]}],
      completionCriteria: [], constraints: [], pendingProposals: [], communicatedClaims: [], agreedFacts: [], uncertainties: [], riskDetails: [], corrections: [], sourceRefs: [ref]
    }],
    sourceRefs: [ref],
    ...overrides
  };
}

function interpretationContext(body = messageBody): AuthorizedInterpretationContext {
  return {
    user: {id: 'user-1', email: 'user@example.com', locale: 'ja-JP', timezone: 'Asia/Tokyo'},
    connectedAccount: {id: 'account-1', provider: 'gmail', emailAddress: 'user@example.com'},
    conversationId: 'conversation-1', sourceEventKey: 'message-1-revision-1', evidenceRevision: 1, focalMessageId: messageId,
    participantIdentities: [{id: participantId, email: 'partner@example.com', displayName: 'Partner'}],
    messages: [{
      id: messageId, direction: 'INBOUND', sender: {participantId, email: 'partner@example.com', displayName: 'Partner'}, recipients: [{email: 'user@example.com'}],
      subject: '修正版', body, sentAt: '2026-08-24T09:00:00+09:00', sourceZones: [{zone: 'AUTHORED_CURRENT', start: 0, end: body.length}]
    }]
  };
}

function replyContext(body = 'ご確認をお願いします。'): AuthorizedReplyContext {
  return {
    user: {id: 'user-1', email: 'user@example.com', locale: 'ja-JP', timezone: 'Asia/Tokyo'},
    connectedAccount: {id: 'account-1', provider: 'gmail', emailAddress: 'user@example.com'},
    conversationId: 'conversation-1', evidenceRevision: 1, replyMode: 'REPLY', trustedRecipientLabels: ['Partner <partner@example.com>'],
    message: {id: messageId, direction: 'INBOUND', sender: {email: 'partner@example.com', displayName: 'Partner'}, recipients: [{email: 'user@example.com'}], subject: '確認', body, sentAt: '2026-08-24T09:00:00+09:00'}
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

  it('keeps communicated claims separate from trusted provider observations', async () => {
    const body = '修正版を添付しました。';
    const ref = {messageId, participantId: null, zone: 'AUTHORED_CURRENT' as const, excerpt: body, start: 0, end: body.length};
    const output = interpretationOutput({
      semanticUnits: [{
        candidateUnitKey: 'attachment-loop', materiality: 'MATERIAL', operationalOutcome: 'receive the revised document',
        obligationLegs: [], expectedEvents: [], temporalFacts: [], completionCriteria: [], constraints: [], pendingProposals: [],
        communicatedClaims: [{id: 'claim-1', kind: 'ATTACHMENT_DELIVERED', value: JSON.stringify('添付しました'), sourceRefs: [ref]}],
        agreedFacts: [], uncertainties: [], riskDetails: [], corrections: [], sourceRefs: [ref]
      }], sourceRefs: [ref]
    });
    const context = {...interpretationContext(body), providerObservations: [{key: 'attachment-observation-1', kind: 'ATTACHMENT_PRESENCE' as const, messageId, attachmentCount: 0}]};
    const result = await new ResponsibilityInterpretationRuntime({transport: new FakeTransport(response(output)), runStore: new InMemoryAIRunStore(), config, currentEvidenceRevision}).run(context);
    expect(result.status).toBe('CANDIDATE');
    if (result.status !== 'CANDIDATE' || result.derivation.status !== 'DERIVED') return;
    expect(result.derivation.command.admission.decision).toBe('NEEDS_REVIEW');
    expect(result.candidate.semantics[0]?.communicatedClaims?.[0]?.kind).toBe('ATTACHMENT_DELIVERED');
    expect(result.candidate.semantics[0]?.uncertainties?.[0]?.reasonCode).toBe('PROVIDER_CONTRADICTION');
    expect(result.candidate.semantics[0]?.uncertainties?.[0]?.provenance[0]).toMatchObject({
      evidenceKind: 'PROVIDER_NON_DELIVERY', providerObservationKey: 'attachment-observation-1',
      sourceLocator: {authorized: true, authorityReference: 'attachment-observation-1'}
    });
  });

  it('understands a clear high-risk request without turning risk alone into admission Review', async () => {
    const unit = interpretationOutput().semanticUnits[0]!;
    const output = interpretationOutput({semanticUnits: [{...unit, riskDetails: [{id: 'risk', targetKind: 'OBLIGATION', riskClass: 'HIGH', reasonCode: 'HIGH_RISK_REQUEST', sourceRefs: [sourceRef]}]}]});
    const result = await new ResponsibilityInterpretationRuntime({transport: new FakeTransport(response(output)), runStore: new InMemoryAIRunStore(), config, currentEvidenceRevision}).run(interpretationContext());
    expect(result.status).toBe('CANDIDATE');
    if (result.status !== 'CANDIDATE' || result.derivation.status !== 'DERIVED') return;
    expect(result.derivation.command.admission.decision).toBe('TRACK');
    expect(result.derivation.command.effects?.map((effect) => effect.operation)).toEqual(['CREATE']);
  });

  it('does not let current acknowledgement plus quoted history create a material action', () => {
    const body = '了解しました。\n> 修正版を明日までに送ってください。';
    const currentRef = {messageId, participantId: null, zone: 'AUTHORED_CURRENT' as const, excerpt: '了解しました。', start: 0, end: 7};
    const quotedStart = body.indexOf('>');
    const quotedRef = {messageId, participantId: null, zone: 'QUOTED_HISTORY' as const, excerpt: '> 修正版を明日までに送ってください。', start: quotedStart, end: body.length};
    const built = buildInterpretationContext({...interpretationContext(body), messages: [{...interpretationContext(body).messages[0]!, sourceZones: [
      {zone: 'AUTHORED_CURRENT' as const, start: 0, end: 7}, {zone: 'QUOTED_HISTORY' as const, start: quotedStart, end: body.length}
    ]}]});
    const unit = interpretationOutput().semanticUnits[0]!;
    expect(() => validateInterpretationOutput({
      ...interpretationOutput({sourceRefs: [currentRef]}, currentRef),
      semanticUnits: [{...unit, sourceRefs: [currentRef, quotedRef], obligationLegs: [{...unit.obligationLegs[0]!, sourceRefs: [quotedRef]}], temporalFacts: []}]
    }, {
      basisEvidenceRevision: 1, allowedMessageIds: built.allowedMessageIds, allowedParticipantIds: built.allowedParticipantIds,
      allowedParticipantEmails: built.allowedParticipantEmails, allowedParticipantRoles: built.allowedParticipantRoles,
      messageParticipantEmails: built.messageParticipantEmails, allowedSourceZones: built.allowedSourceZones,
      authorizedMessageBodies: built.authorizedMessageBodies, authorizedMessageSentAt: built.authorizedMessageSentAt
    })).toThrow('current-turn communicative evidence');
  });

  it('rejects model authority injection and does not create a domain effect', async () => {
    const injected = {...interpretationOutput(), effects: [{operation: 'RESOLVE'}]} as unknown;
    const result = await new ResponsibilityInterpretationRuntime({transport: new FakeTransport(response(injected)), runStore: new InMemoryAIRunStore(), config, currentEvidenceRevision}).run(interpretationContext());
    expect(result.status).toBe('FAILED');
    if (result.status === 'FAILED') expect(result.reason).toContain('outside the model authority');
  });

  it('does not accept provider contradiction as a model-authored reason', async () => {
    const unit = interpretationOutput().semanticUnits[0]!;
    const injected = {...interpretationOutput(), semanticUnits: [{...unit, uncertainties: [{id: 'provider', fieldKey: 'expectedEvents', reasonCode: 'PROVIDER_CONTRADICTION', material: true, reviewRequired: true, sourceRefs: [sourceRef]}]}]};
    const result = await new ResponsibilityInterpretationRuntime({transport: new FakeTransport(response(injected)), runStore: new InMemoryAIRunStore(), config, currentEvidenceRevision}).run(interpretationContext());
    expect(result.status).toBe('FAILED');
    if (result.status === 'FAILED') expect(result.reason).toContain('trusted application evidence');
  });

  it('rejects stale evidence before candidate derivation', async () => {
    const store = new InMemoryAIRunStore();
    const result = await new ResponsibilityInterpretationRuntime({transport: new FakeTransport(response(interpretationOutput())), runStore: store, config, currentEvidenceRevision: () => 2}).run(interpretationContext());
    expect(result.status).toBe('STALE');
    expect(store.runs.get(result.runId)?.status).toBe('STALE');
  });

  it('grounds relative dates in the authorized reference timezone at a UTC day boundary', () => {
    const context = {...interpretationContext(), messages: [{...interpretationContext().messages[0]!, sentAt: '2026-08-24T15:30:00Z'}]};
    const built = buildInterpretationContext(context);
    const unit = interpretationOutput().semanticUnits[0]!;
    const output = interpretationOutput({semanticUnits: [{...unit, temporalFacts: [{...unit.temporalFacts[0]!, resolvedDate: '2026-08-26'}]}]});
    const input = {
      basisEvidenceRevision: 1, allowedMessageIds: built.allowedMessageIds, allowedParticipantIds: built.allowedParticipantIds,
      allowedParticipantEmails: built.allowedParticipantEmails, allowedParticipantRoles: built.allowedParticipantRoles,
      messageParticipantEmails: built.messageParticipantEmails, allowedSourceZones: built.allowedSourceZones,
      authorizedMessageBodies: built.authorizedMessageBodies, authorizedMessageSentAt: built.authorizedMessageSentAt,
      referenceTimezone: built.referenceTimezone
    };
    expect(() => validateInterpretationOutput(output, input)).not.toThrow();
    expect(() => validateInterpretationOutput({...output, semanticUnits: [{...output.semanticUnits[0]!, temporalFacts: [{...output.semanticUnits[0]!.temporalFacts[0]!, resolvedDate: '2026-08-25'}]}]}, input)).toThrow('not derived');
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

  it('keeps trusted reply routing outside the draft prompt and validates reply scope', () => {
    const built = buildDraftContext(replyContext());
    const prompt = built.input[1]?.content[0]?.text ?? '';
    const payload = JSON.parse(prompt.slice(prompt.indexOf('{'), prompt.lastIndexOf('}') + 1)) as Record<string, unknown>;
    expect(payload.currentMessage).toEqual(expect.objectContaining({id: messageId, sender: expect.any(Object), subject: '確認', body: 'ご確認をお願いします。'}));
    expect(payload.currentMessage).not.toHaveProperty('recipients');
    expect(payload.currentMessage).not.toHaveProperty('cc');
    expect(payload.currentMessage).not.toHaveProperty('sourceZones');
    expect(built.manifest.fieldsIncluded).not.toContain('message.recipients');
    expect(() => buildDraftContext({...replyContext(), replyMode: 'FORWARD'} as never)).toThrow('replyMode is invalid');
    expect(() => buildDraftContext({...replyContext(), trustedRecipientLabels: ['']})).toThrow('trustedRecipientLabels');
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

  it('keeps the outbound request/commitment direction pair distinct', () => {
    const inboundRequest = interpretationOutput();
    const check = checkInterpretationOracle('T0-003', inboundRequest);
    expect(check.passed).toBe(false);
    expect(check.failures.join(' ')).toContain('outbound request');
  });

  it('binds the eval manifest to the explicit canonical fixture corpus', () => {
    expect(() => assertFamilyStratifiedHoldout()).not.toThrow();
    expect(G70_EVAL_CASES.map((item) => item.id)).toEqual([
      ...Array.from({length: 44}, (_, index) => `T0-${String(index + 1).padStart(3, '0')}`),
      'PG-22', 'PG-23', 'PG-42', 'PG-43', 'PG-45', 'PG-46', 'PG-47', 'PG-50', 'PG-52', 'PG-60', 'PG-29', 'PG-42-DRAFT', 'PG-42-DRAFT-NOISE', 'PG-45-DRAFT', 'PG-52-DRAFT'
    ]);
    expect(G70_EVAL_CASES.every((item) => item.oracle.includes(':'))).toBe(true);
  });

  it('rejects unauthorized source IDs and trusted authority fields outside the candidate contract', () => {
    const validationInput = {
      basisEvidenceRevision: 1,
      allowedMessageIds: new Set([messageId]),
      allowedParticipantIds: new Set([participantId]),
      allowedSourceZones: new Map([[messageId, [{zone: 'AUTHORED_CURRENT' as const, start: 0, end: messageBody.length}]]]),
      authorizedMessageBodies: new Map([[messageId, messageBody]]),
      authorizedMessageSentAt: new Map([[messageId, '2026-08-24T09:00:00+09:00']])
    };
    expect(() => validateInterpretationOutput({...interpretationOutput(), sourceRefs: [{...sourceRef, messageId: 'other-message'}]}, validationInput)).toThrow(AIContractError);
    expect(() => validateInterpretationOutput({...interpretationOutput(), sender: 'attacker'}, validationInput)).toThrow('outside the model authority');
    expect(() => validateInterpretationOutput({...interpretationOutput(), sourceRefs: [{...sourceRef, zone: 'QUOTED_HISTORY'}]}, validationInput)).toThrow('unauthorized source zone');
  });

  it('requires participant-bearing semantics to preserve the cited message identity association', () => {
    expect(() => buildInterpretationContext({...interpretationContext(), participantIdentities: [{id: participantId, email: 'wrong@example.com'}]})).toThrow('does not match its email');
    const built = buildInterpretationContext(interpretationContext());
    const unit = interpretationOutput().semanticUnits[0]!;
    expect(() => validateInterpretationOutput({
      ...interpretationOutput(),
      semanticUnits: [{...unit, obligationLegs: [{...unit.obligationLegs[0]!, bearerCandidate: 'OTHER_PARTY', participantId, sourceRefs: [sourceRef]}]}]
    }, {
      basisEvidenceRevision: 1,
      allowedMessageIds: built.allowedMessageIds,
      allowedParticipantIds: built.allowedParticipantIds,
      allowedParticipantEmails: built.allowedParticipantEmails,
      messageParticipantEmails: built.messageParticipantEmails,
      allowedSourceZones: built.allowedSourceZones,
      authorizedMessageBodies: built.authorizedMessageBodies
    })).toThrow('participant identity is not associated');
  });

  it('grounds material values, scopes reopen identity, and rejects the connected user as counterpart', () => {
    const built = buildInterpretationContext(interpretationContext());
    const validationInput = {
      basisEvidenceRevision: 1,
      allowedMessageIds: built.allowedMessageIds,
      allowedParticipantIds: built.allowedParticipantIds,
      allowedParticipantEmails: built.allowedParticipantEmails,
      allowedParticipantRoles: built.allowedParticipantRoles,
      messageParticipantEmails: built.messageParticipantEmails,
      allowedSourceZones: built.allowedSourceZones,
      authorizedMessageBodies: built.authorizedMessageBodies,
      authorizedMessageSentAt: built.authorizedMessageSentAt,
      allowedExistingResponsibilityOutcomes: new Map([['prior-1', 'deliver the signed contract']])
    };
    expect(() => validateInterpretationOutput({
      ...interpretationOutput(),
      semanticUnits: [{...interpretationOutput().semanticUnits[0]!, pendingProposals: [{id: 'p', kind: 'DATE', value: JSON.stringify({date: '2099-01-01'}), candidateStatus: 'PENDING', sourceRefs: [sourceRef]}], agreedFacts: []}]
    }, validationInput)).toThrow('not grounded');
    expect(() => validateInterpretationOutput({
      ...interpretationOutput(),
      semanticUnits: [{...interpretationOutput().semanticUnits[0]!, identityRelation: {kind: 'SAME_UNSATISFIED_OUTCOME', priorOperationalOutcome: 'deliver the signed contract'}}]
    }, validationInput)).toThrow('unsupported field priorOperationalOutcome');
    expect(() => validateInterpretationOutput({
      ...interpretationOutput(),
      semanticUnits: [{...interpretationOutput().semanticUnits[0]!, identityRelation: {kind: 'SAME_UNSATISFIED_OUTCOME', priorResponsibilityId: 'not-in-context'}}]
    }, validationInput)).toThrow('outside the authorized scoped Responsibilities');
  });

  it('derives participant trust role from the connected account address', () => {
    expect(() => buildInterpretationContext({...interpretationContext(), participantIdentities: [{id: participantId, email: 'user@example.com', role: 'OTHER_PARTY'}]})).toThrow('role does not match');
  });

  it('rejects reducer-invalid obligation and temporal values at the model boundary', () => {
    const validationInput = {
      basisEvidenceRevision: 1,
      allowedMessageIds: new Set([messageId]),
      allowedParticipantIds: new Set([participantId]),
      allowedSourceZones: new Map([[messageId, [{zone: 'AUTHORED_CURRENT' as const, start: 0, end: messageBody.length}]]]),
      authorizedMessageBodies: new Map([[messageId, messageBody]]),
      authorizedMessageSentAt: new Map([[messageId, '2026-08-24T09:00:00+09:00']])
    };
    expect(() => validateInterpretationOutput({
      ...interpretationOutput(),
      semanticUnits: [{...interpretationOutput().semanticUnits[0]!, obligationLegs: [{...interpretationOutput().semanticUnits[0]!.obligationLegs[0]!, basisKind: null}]}]
    }, validationInput)).toThrow('basisKind');
    expect(() => validateInterpretationOutput({
      ...interpretationOutput(),
      semanticUnits: [{...interpretationOutput().semanticUnits[0]!, temporalFacts: [{...interpretationOutput().semanticUnits[0]!.temporalFacts[0]!, resolvedDate: '2026-02-30'}]}]
    }, validationInput)).toThrow('valid date');
    expect(() => validateInterpretationOutput({
      ...interpretationOutput(),
      semanticUnits: [{...interpretationOutput().semanticUnits[0]!, temporalFacts: [{...interpretationOutput().semanticUnits[0]!.temporalFacts[0]!, obligationLegId: 'missing-leg'}]}]
    }, validationInput)).toThrow('unknown obligation leg');
    expect(() => validateInterpretationOutput({...interpretationOutput(), sourceMessageId: 'message-2'}, {...validationInput, allowedMessageIds: new Set([messageId, 'message-2']), expectedSourceMessageId: messageId})).toThrow('focal message');
  });
});
