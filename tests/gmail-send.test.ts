import {beforeEach, describe, expect, it, vi} from 'vitest';

import {buildGmailMessageId, buildGmailTextMime, buildTrustedReconciledSendCommand, GmailSendService} from '@/server/gmail/send';
import {GmailProviderError} from '@/server/gmail/types';
import type {GmailMessage, GmailProviderClient} from '@/server/gmail/types';
import type {SendOperationReadModel} from '@/server/db/repositories/communication';
import type {ResponsibilityState} from '@/server/responsibility';

const originalMessageId = '<original@example.com>';

function gmailMessage(id: string, messageId: string, overrides: Partial<GmailMessage> = {}): GmailMessage {
  return {
    id,
    threadId: 'thread-1',
    labelIds: ['SENT'],
    internalDate: '1893456000000',
    payload: {
      mimeType: 'text/plain',
      headers: [
        {name: 'From', value: 'Owner <owner@example.com>'},
        {name: 'To', value: 'Person <person@example.com>'},
        {name: 'Subject', value: 'Re: Request'},
        {name: 'Message-ID', value: messageId},
        {name: 'References', value: '<prior@example.com>'}
      ],
      body: {data: Buffer.from(`body ${id}`).toString('base64url')}
    },
    ...overrides
  };
}

function snapshot(): Record<string, unknown> {
  return {
    draftId: 'draft-1', draftVersion: 1, userId: 'user-1', connectedAccountId: 'account-1',
    sender: {email: 'owner@example.com', displayName: 'Owner'}, conversationId: 'conversation-1',
    inReplyToMessageId: 'message-1', mode: 'REPLY',
    recipients: [{email: 'person@example.com', displayName: 'Person'}], cc: [], bcc: [],
    subject: 'Re: Request', bodyFormat: 'TEXT', body: 'Confirmed.\nThanks.',
    replyContext: {providerThreadId: 'thread-1', inReplyToProviderMessageId: 'original-provider-1'}
  };
}

function operation(status: SendOperationReadModel['status'] = 'PENDING'): SendOperationReadModel {
  return {
    id: 'operation-1', userId: 'user-1', draftId: 'draft-1', connectedAccountId: 'account-1', idempotencyKey: 'key-1', kind: 'IMMEDIATE',
    status, draftSnapshot: snapshot(), attemptCount: status === 'PENDING' ? 0 : 1,
    providerResultId: status === 'PROVIDER_ACCEPTED' ? 'sent-1' : null,
    providerMessageId: status === 'PROVIDER_ACCEPTED' ? 'sent-1' : null,
    lastErrorCode: null, createdAt: '2030-01-01T00:00:00.000Z', updatedAt: '2030-01-01T00:00:00.000Z'
  };
}

function providerFor(input: {
  original?: GmailMessage;
  sent?: GmailMessage;
  search?: readonly string[];
  send?: () => Promise<GmailMessage>;
} = {}): GmailProviderClient {
  const original = input.original ?? gmailMessage('original-provider-1', originalMessageId, {labelIds: ['INBOX']});
  const sent = input.sent ?? gmailMessage('sent-1', buildGmailMessageId('operation-1'));
  return {
    exchangeCode: vi.fn(), refresh: vi.fn(), revoke: vi.fn(),
    getProfile: vi.fn(), watch: vi.fn(), listMessages: vi.fn(), listHistory: vi.fn(), getAttachment: vi.fn(async () => ({data: ''})),
    getMessage: vi.fn(async (_token, id) => id === original.id ? original : sent),
    sendMessage: vi.fn(input.send ?? (async () => ({id: sent.id, threadId: sent.threadId, labelIds: ['SENT']}))),
    listMessagesByRfc822MessageId: vi.fn(async () => ({messages: (input.search ?? []).map((id) => ({id, threadId: 'thread-1'}))}))
  };
}

function store(initial: SendOperationReadModel) {
  let current = initial;
  return {
    getSendOperation: vi.fn(async () => current),
    claimSendOperation: vi.fn(async () => {
      if (current.status === 'PENDING') {
        current = {...current, status: 'DISPATCHING', attemptCount: current.attemptCount + 1};
        return {...current, claimed: true};
      }
      return {...current, claimed: false};
    }),
    transitionSendOperation: vi.fn(async (input: {expectedStatuses: readonly string[]; status: SendOperationReadModel['status']; providerMessageId?: string | null; providerResultId?: string | null; lastErrorCode?: string | null}) => {
      if (input.expectedStatuses.includes(current.status)) current = {
        ...current, status: input.status,
        ...(input.providerMessageId !== undefined ? {providerMessageId: input.providerMessageId} : {}),
        ...(input.providerResultId !== undefined ? {providerResultId: input.providerResultId} : {}),
        ...(input.lastErrorCode !== undefined ? {lastErrorCode: input.lastErrorCode} : {})
      };
      return current;
    }),
    current: () => current
  };
}

const credentials = {getAccessToken: vi.fn(async () => 'token')};
const evidence = {upsertNormalizedMessage: vi.fn(async () => ({messageId: 'db-sent-1', conversationId: 'conversation-1', evidenceRevision: 8, changed: true}))};
const responsibilities = {getResponsibility: vi.fn(), applyTrustedCommand: vi.fn()};

function responsibility(legs: ResponsibilityState['obligationLegs']): ResponsibilityState {
  return {
    id: 'responsibility-1', userId: 'user-1', connectedAccountId: 'account-1', conversationId: 'conversation-1',
    operationalOutcome: 'complete the request', resolutionStatus: 'OPEN', liveTrackingState: 'TRACKING_ACTIVE', attentionMode: 'PRESENT',
    acceptedEvidenceRevision: 4, aggregateVersion: 7, obligationLegs: legs, expectedEvents: [], temporalFacts: [],
    details: {completionCriteria: [], constraints: [], pendingProposals: [], agreedFacts: [], uncertainties: [], riskDetails: []},
    fieldDecisions: [], provenance: [], resolutionHistory: []
  };
}

function leg(id: string, bearer: 'USER' | 'OTHER_PARTY', actionCode: string) {
  return {id, bearer, actionCode, status: 'OPEN' as const, actionability: 'ACTIONABLE' as const, basisKind: 'COMMUNICATED_CLAIM', provenance: []};
}

describe('G51 Gmail send boundary', () => {
  beforeEach(() => vi.clearAllMocks());

  it('serializes a deterministic, RFC-compliant threaded MIME and rejects header injection', () => {
    const built = buildGmailTextMime({
      sendOperationId: 'operation-1', snapshot: snapshot() as never,
      originalMessage: gmailMessage('original-provider-1', originalMessageId, {labelIds: ['INBOX']}),
      date: new Date('2030-01-01T00:00:00.000Z')
    });
    const raw = Buffer.from(built.raw, 'base64url').toString('utf8');
    const [headers, encodedBody] = raw.split('\r\n\r\n');
    expect(built.messageId).toBe(buildGmailMessageId('operation-1'));
    expect(headers).toContain('Date: Tue, 01 Jan 2030 00:00:00 +0000');
    expect(headers).toContain('In-Reply-To: <original@example.com>');
    expect(headers).toContain('References: <prior@example.com> <original@example.com>');
    expect(headers).toContain('Subject: Re: Request');
    expect(headers).toContain('Content-Transfer-Encoding: base64');
    expect(Buffer.from((encodedBody ?? '').replace(/\r\n/g, ''), 'base64').toString('utf8')).toBe('Confirmed.\r\nThanks.');
    expect(raw.split('\r\n').every((line) => line.length <= 998)).toBe(true);
    expect(() => buildGmailTextMime({sendOperationId: 'operation-1', snapshot: {...snapshot(), subject: 'bad\r\nBcc: attacker@example.com'} as never, originalMessage: gmailMessage('original-provider-1', originalMessageId, {labelIds: ['INBOX']})})).toThrow('MIME_HEADER_INVALID');
  });

  it('folds long Unicode headers and base64 body lines within RFC limits', () => {
    const subject = '長い日本語件名'.repeat(30);
    const original = gmailMessage('original-provider-1', originalMessageId, {labelIds: ['INBOX']});
    const subjectHeader = original.payload?.headers?.find((item) => item.name === 'Subject');
    if (subjectHeader) subjectHeader.value = subject;
    const built = buildGmailTextMime({
      sendOperationId: 'operation-1',
      snapshot: {...snapshot(), subject, sender: {email: 'owner@example.com', displayName: '非常に長い送信者名'.repeat(20)}, body: '本文'.repeat(5000)} as never,
      originalMessage: original,
      date: new Date('2030-01-01T00:00:00.000Z')
    });
    const raw = Buffer.from(built.raw, 'base64url').toString('utf8');
    expect(raw).toContain('=?UTF-8?B?');
    expect(raw.split('\r\n').every((line) => line.length <= 998)).toBe(true);
  });

  it('claims once, sends once, and reconciles the sent Source', async () => {
    const operationStore = store(operation());
    const service = new GmailSendService(providerFor(), credentials as never, operationStore as never, evidence as never, responsibilities as never);
    const result = await service.dispatch({userId: 'user-1', sendOperationId: 'operation-1'});
    expect(result.status).toBe('RECONCILED');
    expect(operationStore.claimSendOperation).toHaveBeenCalledTimes(1);
    expect(operationStore.transitionSendOperation).toHaveBeenCalledWith(expect.objectContaining({status: 'PROVIDER_ACCEPTED'}));
    expect(evidence.upsertNormalizedMessage).toHaveBeenCalledTimes(1);
  });

  it('never sends when restarting from DISPATCHING and keeps zero-match acceptance ambiguous', async () => {
    const operationStore = store(operation('DISPATCHING'));
    const provider = providerFor();
    const service = new GmailSendService(provider, credentials as never, operationStore as never, evidence as never, responsibilities as never);
    const result = await service.dispatch({userId: 'user-1', sendOperationId: 'operation-1'});
    expect(result.status).toBe('AMBIGUOUS');
    expect(provider.sendMessage).not.toHaveBeenCalled();
    expect(evidence.upsertNormalizedMessage).not.toHaveBeenCalled();
  });

  it('maps explicit provider rejection to FAILED and transport failure to AMBIGUOUS', async () => {
    const rejectedStore = store(operation());
    const rejected = new GmailSendService(providerFor({send: async () => {throw new GmailProviderError(400, 'INVALID_ARGUMENT');}}), credentials as never, rejectedStore as never, evidence as never, responsibilities as never);
    expect((await rejected.dispatch({userId: 'user-1', sendOperationId: 'operation-1'})).status).toBe('FAILED');

    const ambiguousStore = store(operation());
    const ambiguous = new GmailSendService(providerFor({send: async () => {throw new GmailProviderError(503, 'UNAVAILABLE');}}), credentials as never, ambiguousStore as never, evidence as never, responsibilities as never);
    expect((await ambiguous.dispatch({userId: 'user-1', sendOperationId: 'operation-1'})).status).toBe('AMBIGUOUS');
  });

  it('never downgrades known provider acceptance when Source reconciliation is temporarily unavailable', async () => {
    const operationStore = store(operation('PROVIDER_ACCEPTED'));
    const provider = providerFor();
    vi.mocked(provider.getMessage).mockRejectedValue(new GmailProviderError(404, 'NOT_INDEXED_YET'));
    const service = new GmailSendService(provider, credentials as never, operationStore as never, evidence as never, responsibilities as never);
    const result = await service.dispatch({userId: 'user-1', sendOperationId: 'operation-1'});
    expect(result.status).toBe('PROVIDER_ACCEPTED');
    expect(result.providerMessageId).toBe('sent-1');
    expect(provider.sendMessage).not.toHaveBeenCalled();
    expect(provider.listMessagesByRfc822MessageId).not.toHaveBeenCalled();
  });

  it('keeps provider acceptance durable when a current bound Responsibility re-evaluation is rejected', async () => {
    const state = responsibility([leg('user-send', 'USER', 'SEND_REVISED_DOCUMENT')]);
    const bound = {
      ...operation(),
      draftSnapshot: {
        ...snapshot(),
        responsibilityBinding: {responsibilityId: state.id, aggregateVersion: state.aggregateVersion, evidenceRevision: state.acceptedEvidenceRevision}
      }
    };
    const operationStore = store(bound);
    const provider = providerFor();
    const responsibilityStore = {
      getResponsibility: vi.fn(async () => ({state})),
      applyTrustedCommand: vi.fn(async () => ({status: 'REJECTED', admission: 'TRACK', reason: 'trusted evidence mismatch', effects: [], responsibilities: [state]}))
    };
    const service = new GmailSendService(provider, credentials as never, operationStore as never, evidence as never, responsibilityStore as never);
    const result = await service.dispatch({userId: 'user-1', sendOperationId: 'operation-1'});
    expect(result.status).toBe('PROVIDER_ACCEPTED');
    expect(result.lastErrorCode).toContain('RESPONSIBILITY_REEVALUATION_REJECTED');
    expect(provider.sendMessage).toHaveBeenCalledTimes(1);
    expect(responsibilityStore.applyTrustedCommand).toHaveBeenCalledTimes(1);
  });

  it('reconciles exactly one RFC822 Message-ID match and guards multiple matches', async () => {
    const oneStore = store(operation('AMBIGUOUS'));
    const one = new GmailSendService(providerFor({search: ['sent-1']}), credentials as never, oneStore as never, evidence as never, responsibilities as never);
    expect((await one.dispatch({userId: 'user-1', sendOperationId: 'operation-1'})).status).toBe('RECONCILED');

    vi.clearAllMocks();
    const manyStore = store(operation('AMBIGUOUS'));
    const many = new GmailSendService(providerFor({search: ['sent-1', 'sent-2']}), credentials as never, manyStore as never, evidence as never, responsibilities as never);
    expect((await many.dispatch({userId: 'user-1', sendOperationId: 'operation-1'})).status).toBe('AMBIGUOUS');
    expect(evidence.upsertNormalizedMessage).not.toHaveBeenCalled();
  });

  it('closes only the user send leg: T03 resolves fully covered work, T04 returns to WAITING', () => {
    const t03 = buildTrustedReconciledSendCommand({
      operation: operation('PROVIDER_ACCEPTED'), snapshot: snapshot() as never,
      responsibility: responsibility([leg('user-send', 'USER', 'SEND_REVISED_DOCUMENT')]),
      messageId: 'db-sent-1', evidenceRevision: 8
    });
    expect(t03?.effects?.[0]?.operation).toBe('RESOLVE');

    const t04 = buildTrustedReconciledSendCommand({
      operation: operation('PROVIDER_ACCEPTED'), snapshot: snapshot() as never,
      responsibility: responsibility([leg('follow-up', 'USER', 'FOLLOW_UP'), leg('approval', 'OTHER_PARTY', 'APPROVE_REQUEST')]),
      messageId: 'db-sent-1', evidenceRevision: 8
    });
    expect(t04?.effects?.[0]?.operation).toBe('UPDATE');
    expect(t04?.effects?.[0]?.responsibilityRef).toBe('responsibility-1');
    expect(t04?.effects?.[0]?.patch?.obligationLegs?.find((item) => item.id === 'approval')?.status).toBe('OPEN');
  });
});
