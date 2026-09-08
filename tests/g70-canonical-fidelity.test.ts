import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

import {describe, expect, it} from 'vitest';

import {
  G70_EVAL_CASES,
  InMemoryAIRunStore,
  ResponsibilityInterpretationRuntime,
  assertCanonicalFixtureFidelity,
  assertExecutableFixtureStratification,
  attachmentObservationKey,
  checkInterpretationOracle,
  type AuthorizedAIMessage,
  type AuthorizedAIParticipant,
  type AuthorizedInterpretationContext,
  type G70CanonicalEnvelope,
  type ModelInterpretationOutput,
  type ResponsesRequest,
  type ResponsesTransport,
  type TrustedProviderObservation
} from '@/server/ai';
import type {ResponsibilityState} from '@/server/responsibility';

const ORACLE_FILES = [
  'docs/product/responsibility/TIER-0-CRITICAL-ORACLES.md',
  'docs/product/responsibility/TIER-0-DETAILED-ORACLES-BATCH-2.md',
  'docs/product/responsibility/TIER-0-DETAILED-ORACLES-BATCH-3.md'
] as const;

const ids = {
  user: '00000000-0000-4000-8000-000000000001',
  partner: '00000000-0000-4000-8000-000000000010',
  manager: '00000000-0000-4000-8000-000000000011',
  tanaka: '00000000-0000-4000-8000-000000000012',
  sato: '00000000-0000-4000-8000-000000000013',
  responsibility: '00000000-0000-4000-8000-000000000101'
} as const;

const participantIdByEmail = new Map([
  ['user@example.com', ids.user],
  ['partner@example.com', ids.partner],
  ['manager@example.com', ids.manager],
  ['tanaka@example.com', ids.tanaka],
  ['sato@example.com', ids.sato]
]);

function oracleBlock(caseId: string): string {
  for (const file of ORACLE_FILES) {
    const text = readFileSync(resolve(process.cwd(), file), 'utf8');
    for (const match of text.matchAll(/```yaml\n([\s\S]*?)```/g)) {
      const block = match[1] ?? '';
      if (new RegExp(`^case_id:\\s*${caseId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm').test(block)) return block;
    }
  }
  throw new Error(`canonical YAML oracle not found: ${caseId}`);
}

function priorState(input: {userId: string; accountId: string; conversationId: string; outcome: string; status: 'OPEN' | 'RESOLVED'}): ResponsibilityState {
  return {
    id: ids.responsibility,
    userId: input.userId,
    connectedAccountId: input.accountId,
    conversationId: input.conversationId,
    operationalOutcome: input.outcome,
    resolutionStatus: input.status,
    ...(input.status === 'RESOLVED' ? {resolutionReason: 'SATISFIED' as const, resolvedAt: '2026-08-24T08:00:00.000Z'} : {}),
    liveTrackingState: 'TRACKING_ACTIVE',
    attentionMode: 'PRESENT',
    acceptedEvidenceRevision: 1,
    aggregateVersion: 1,
    obligationLegs: [],
    expectedEvents: [],
    temporalFacts: [],
    details: {completionCriteria: [], constraints: [], pendingProposals: [], agreedFacts: [], uncertainties: [], riskDetails: []},
    fieldDecisions: [],
    provenance: [],
    resolutionHistory: []
  };
}

function message(input: {id: string; sender: string; recipients: string[]; subject?: string; body: string; sentAt?: string}): AuthorizedAIMessage {
  const sourceZones = [{zone: 'AUTHORED_CURRENT' as const, start: 0, end: input.body.length}];
  return {
    id: input.id,
    direction: 'INBOUND',
    sender: {email: input.sender, participantId: participantIdByEmail.get(input.sender)},
    recipients: input.recipients.map((email) => ({email, participantId: participantIdByEmail.get(email)})),
    subject: input.subject ?? '(no subject)',
    body: input.body,
    sentAt: input.sentAt ?? '2026-08-24T09:00:00+09:00',
    sourceZones
  };
}

function participantsFor(messages: readonly AuthorizedAIMessage[], connectedEmail: string): AuthorizedAIParticipant[] {
  const map = new Map<string, {id: string; email: string; messageIds: Set<string>; roles: Set<'SENDER' | 'TO' | 'CC'>; isConnectedAccount: boolean}>();
  const add = (email: string, messageId: string, role: 'SENDER' | 'TO' | 'CC') => {
    const id = participantIdByEmail.get(email);
    if (!id) throw new Error(`missing participant fixture ID for ${email}`);
    const current = map.get(email) ?? {id, email, messageIds: new Set<string>(), roles: new Set<'SENDER' | 'TO' | 'CC'>(), isConnectedAccount: email === connectedEmail};
    current.messageIds.add(messageId);
    current.roles.add(role);
    map.set(email, current);
  };
  for (const item of messages) {
    add(item.sender.email, item.id, 'SENDER');
    for (const recipient of item.recipients) add(recipient.email, item.id, 'TO');
    for (const cc of item.cc ?? []) add(cc.email, item.id, 'CC');
  }
  return [...map.values()].map((item) => ({...item, messageIds: [...item.messageIds], roles: [...item.roles]}));
}

function contextFor(caseId: string): AuthorizedInterpretationContext {
  const userId = ids.user;
  const accountId = 'account-1';
  const conversationId = `conversation-${caseId.toLowerCase()}`;
  let connectedEmail = 'user@example.com';
  let messages: AuthorizedAIMessage[];
  let existingResponsibilities: ResponsibilityState[] = [];
  let providerObservations: TrustedProviderObservation[] | undefined;

  switch (caseId) {
    case 'T0-001':
      messages = [message({id: 'm1', sender: 'partner@example.com', recipients: ['user@example.com'], subject: '契約書の修正版', body: '修正版を明日までに送ってください。'})];
      break;
    case 'T0-002':
      messages = [message({id: 'm1', sender: 'partner@example.com', recipients: ['user@example.com'], subject: '契約書の修正版', body: '修正版を明日送ります。'})];
      break;
    case 'T0-014':
      messages = [
        message({id: 'm1', sender: 'partner@example.com', recipients: ['user@example.com'], subject: '最終契約書', body: '最終契約書を送ってください。'}),
        message({id: 'm2', sender: 'partner@example.com', recipients: ['user@example.com'], subject: 'Re: 最終契約書', body: '一旦止めてください。こちらから連絡するまで進めないでください。', sentAt: '2026-08-24T10:00:00+09:00'})
      ];
      existingResponsibilities = [priorState({userId, accountId, conversationId, outcome: 'send the final contract after counterpart clearance', status: 'OPEN'})];
      break;
    case 'T0-029':
      messages = [message({id: 'm-failure', sender: 'partner@example.com', recipients: ['user@example.com'], body: '添付が壊れて開けません。再送お願いします。'})];
      existingResponsibilities = [priorState({userId, accountId, conversationId, outcome: 'deliver a usable signed contract to the counterpart', status: 'RESOLVED'})];
      break;
    case 'T0-034':
      messages = [message({id: 'm2', sender: 'partner@example.com', recipients: ['user@example.com'], subject: 'Re: 契約書修正版', body: '修正版を添付しました。'})];
      existingResponsibilities = [priorState({userId, accountId, conversationId, outcome: 'receive the revised contract document from partner@example.com', status: 'OPEN'})];
      providerObservations = [{
        observationKey: attachmentObservationKey('m2', 1), messageId: 'm2', kind: 'ATTACHMENT_PRESENCE',
        status: 'ABSENT', completeness: 'COMPLETE', attachmentCount: 0, source: 'GMAIL_NORMALIZED'
      }];
      break;
    case 'T0-040':
      connectedEmail = 'sato@example.com';
      messages = [message({id: 'm1', sender: 'manager@example.com', recipients: ['tanaka@example.com', 'sato@example.com'], subject: '本日の対応', body: '田中さんか佐藤さん、どちらか本日中に対応お願いします。'})];
      break;
    default:
      throw new Error(`unsupported canonical fixture: ${caseId}`);
  }

  const focalMessageId = caseId === 'T0-014' ? 'm2' : caseId === 'T0-029' ? 'm-failure' : caseId === 'T0-034' ? 'm2' : 'm1';
  return {
    user: {id: userId, email: connectedEmail, locale: 'ja-JP', timezone: 'Asia/Tokyo'},
    connectedAccount: {id: accountId, provider: 'gmail', emailAddress: connectedEmail},
    conversationId,
    sourceEventKey: `${caseId}:focal`,
    evidenceRevision: 1,
    focalMessageId,
    messages,
    participants: participantsFor(messages, connectedEmail),
    existingResponsibilities,
    ...(providerObservations ? {providerObservations} : {})
  };
}

function actualEnvelope(context: AuthorizedInterpretationContext): G70CanonicalEnvelope {
  const participants = [...new Set(context.messages.flatMap((item) => [item.sender.email, ...item.recipients.map((recipient) => recipient.email), ...(item.cc ?? []).map((cc) => cc.email)]).map((email) => email.toLowerCase()))].sort();
  const provider = context.providerObservations?.find((item) => item.kind === 'ATTACHMENT_PRESENCE');
  const focal = context.messages.find((item) => item.id === context.focalMessageId);
  return {
    inputKind: 'MESSAGE',
    focalMessageId: context.focalMessageId,
    directions: context.messages.map((item) => item.direction),
    participantEmails: participants,
    existingResponsibilityState: context.existingResponsibilities?.[0]?.resolutionStatus ?? 'NONE',
    providerAttachmentObservation: provider?.completeness === 'COMPLETE' && provider.status === 'ABSENT'
      ? 'COMPLETE_ABSENT' : provider?.completeness === 'COMPLETE' && provider.status === 'PRESENT' ? 'COMPLETE_PRESENT' : 'NONE',
    ...(focal ? {focalBody: focal.body} : {})
  };
}

function refFor(context: AuthorizedInterpretationContext) {
  const focal = context.messages.find((item) => item.id === context.focalMessageId)!;
  return {messageId: focal.id, zone: 'AUTHORED_CURRENT' as const, excerpt: focal.body, start: 0, end: focal.body.length};
}

function outputFor(caseId: string, context: AuthorizedInterpretationContext): ModelInterpretationOutput {
  const ref = refFor(context);
  const base = {
    schemaVersion: 2 as const,
    basisEvidenceRevision: 1,
    status: 'CANDIDATE' as const,
    sourceMessageId: context.focalMessageId,
    abstentionReason: undefined,
    sourceRefs: [ref]
  };
  const material = (overrides: Record<string, unknown> = {}): ModelInterpretationOutput => ({
    ...base,
    semanticUnits: [{
      candidateUnitKey: 'unit-1', materiality: 'MATERIAL', operationalOutcome: 'handle the current request',
      obligationLegs: [], expectedEvents: [], temporalFacts: [], completionCriteria: [], constraints: [], pendingProposals: [], agreedFacts: [], uncertainties: [], riskDetails: [], communicatedClaims: [], corrections: [], sourceRefs: [ref],
      ...overrides
    }]
  } as ModelInterpretationOutput);

  switch (caseId) {
    case 'T0-001':
      return material({
        operationalOutcome: 'send the requested revised document to the counterpart',
        obligationLegs: [{id: 'leg-send', bearerCandidate: 'USER', actionCode: 'SEND_REVISED_DOCUMENT', blockedByCondition: false, sourceRefs: [ref]}],
        temporalFacts: [{id: 'due', temporalKind: 'SOURCE_DUE', originalExpression: '明日まで', conflictCandidate: false, sourceRefs: [ref]}]
      });
    case 'T0-002':
      return material({
        operationalOutcome: 'receive the promised revised document from the counterpart',
        expectedEvents: [{id: 'event-send', actor: 'OTHER_PARTY', participantId: ids.partner, eventCode: 'SEND_REVISED_DOCUMENT', expectationStrength: 'FIRM', sourceRefs: [ref]}]
      });
    case 'T0-014':
      return material({
        operationalOutcome: 'send the final contract after counterpart clearance',
        identityRelation: {kind: 'CONTINUES', priorResponsibilityId: ids.responsibility},
        constraints: [{id: 'hold', code: 'DO_NOT_PROCEED', summary: 'wait until the counterpart resumes the work', sourceRefs: [ref]}]
      });
    case 'T0-029':
      return material({
        operationalOutcome: 'deliver a usable signed contract to the counterpart',
        identityRelation: {kind: 'SAME_UNSATISFIED_OUTCOME', priorResponsibilityId: ids.responsibility},
        obligationLegs: [{id: 'leg-resend', bearerCandidate: 'USER', actionCode: 'RESEND_USABLE_SIGNED_CONTRACT', blockedByCondition: false, sourceRefs: [ref]}],
        communicatedClaims: [{id: 'failure-report', kind: 'DELIVERY_FAILURE_REPORTED', sourceRefs: [ref]}]
      });
    case 'T0-034':
      return material({
        operationalOutcome: 'receive the revised contract document from partner@example.com',
        identityRelation: {kind: 'CONTINUES', priorResponsibilityId: ids.responsibility},
        communicatedClaims: [{id: 'claim-attached', kind: 'ATTACHMENT_DELIVERED', sourceRefs: [ref]}]
      });
    case 'T0-040':
      return {...base, status: 'ABSTAINED', abstentionReason: 'AMBIGUOUS', semanticUnits: []};
    default:
      throw new Error(`unsupported canonical output: ${caseId}`);
  }
}

class FakeTransport implements ResponsesTransport {
  readonly kind = 'test' as const;
  readonly requests: ResponsesRequest[] = [];
  constructor(private readonly output: ModelInterpretationOutput) {}
  async create(request: ResponsesRequest): Promise<unknown> {
    this.requests.push(request);
    return {status: 'completed', output_text: JSON.stringify(this.output)};
  }
}

const config = {model: 'gpt-5.6', modelConfigVersion: 'g70-canonical-test-v1', dataControlMode: 'UNVERIFIED' as const};
const CANONICAL_CASE_IDS = ['T0-001', 'T0-002', 'T0-014', 'T0-029', 'T0-034', 'T0-040'] as const;

describe('G70 canonical-fidelity interpretation fixtures', () => {
  it('binds executable scenario envelopes directly to the owning canonical YAML oracles', () => {
    const fixtures = CANONICAL_CASE_IDS.map((id) => {
      const manifest = G70_EVAL_CASES.find((item) => item.id === id)!;
      const context = contextFor(id);
      expect(() => assertCanonicalFixtureFidelity(actualEnvelope(context), oracleBlock(id), id)).not.toThrow();
      return {id, family: manifest.family, lane: manifest.lane, split: manifest.split};
    });
    expect(() => assertExecutableFixtureStratification(fixtures)).not.toThrow();

    const wrong = actualEnvelope(contextFor('T0-034'));
    expect(() => assertCanonicalFixtureFidelity({...wrong, directions: ['OUTBOUND']}, oracleBlock('T0-034'), 'T0-034')).toThrow(/directions/);
    expect(() => assertCanonicalFixtureFidelity({...wrong, focalMessageId: 'm1'}, oracleBlock('T0-034'), 'T0-034')).toThrow(/focalMessageId/);
    expect(() => assertCanonicalFixtureFidelity({...wrong, existingResponsibilityState: 'NONE'}, oracleBlock('T0-034'), 'T0-034')).toThrow(/existingResponsibilityState/);
  });

  it('refuses the canonical USER_COMMAND case T0-026 as an interpretation fixture', () => {
    const envelope = {inputKind: 'MESSAGE' as const, focalMessageId: 'm1', directions: ['INBOUND' as const], participantEmails: ['user@example.com'], existingResponsibilityState: 'OPEN' as const, providerAttachmentObservation: 'NONE' as const, focalBody: '木曜までに終わらせたい'};
    expect(() => assertCanonicalFixtureFidelity(envelope, oracleBlock('T0-026'), 'T0-026')).toThrow(/inputKind/);
    expect(G70_EVAL_CASES.some((item) => item.id === 'T0-026')).toBe(false);
  });

  it('executes only faithful message-owned canonical fixtures through the bounded runtime', async () => {
    for (const id of CANONICAL_CASE_IDS) {
      const context = contextFor(id);
      const output = outputFor(id, context);
      const transport = new FakeTransport(output);
      const result = await new ResponsibilityInterpretationRuntime({
        transport,
        runStore: new InMemoryAIRunStore(),
        config,
        currentEvidenceRevision: () => 1
      }).run(context);
      expect(checkInterpretationOracle(id, output).passed, id).toBe(true);
      expect(result.status, id).toBe(id === 'T0-040' ? 'ABSTAINED' : 'CANDIDATE');
      if (id === 'T0-034' && result.status === 'CANDIDATE' && result.derivation.status === 'DERIVED') {
        expect(result.derivation.command.provenance?.some((item) => item.evidenceKind === 'PROVIDER_NON_DELIVERY' && item.providerObservationKey === attachmentObservationKey('m2', 1))).toBe(true);
        expect(JSON.stringify(transport.requests)).not.toContain(attachmentObservationKey('m2', 1));
      }
    }
  });
});
