import {beforeEach, describe, expect, it, vi} from 'vitest';

import {buildGmailMessageId, buildGmailTextMime, buildTrustedProviderNonDeliveryCommand, buildTrustedReconciledSendCommand, GmailSendService} from '@/server/gmail/send';
import {extractGmailFailedDeliveryStatus} from '@/server/gmail/delivery-status';
import {GmailProviderError} from '@/server/gmail/types';
import type {GmailMessage, GmailProviderClient} from '@/server/gmail/types';
import type {SendOperationReadModel} from '@/server/db/repositories/communication';
import type {ResponsibilityState} from '@/server/responsibility';

const originalMessageId = '<original@example.com>';
const providerFinalMessageId = '<provider-final@mail.gmail.com>';

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

function failedDsnMessage(originalRfcMessageId: string): GmailMessage {
  return {
    id: 'dsn-1', threadId: 'dsn-thread-1', labelIds: ['INBOX'], internalDate: '1893456001000',
    payload: {
      mimeType: 'multipart/report',
      headers: [
        {name: 'From', value: 'Mail Delivery Subsystem <mailer-daemon@example.net>'},
        {name: 'To', value: 'owner@example.com'},
        {name: 'Subject', value: 'Delivery Status Notification (Failure)'},
        {name: 'Message-ID', value: '<dsn-1@example.net>'},
        {name: 'Content-Type', value: 'multipart/report; report-type=delivery-status; boundary=dsn'}
      ],
      parts: [
        {mimeType: 'text/plain', body: {data: Buffer.from('Delivery failed.').toString('base64url')}},
        {mimeType: 'message/delivery-status', body: {data: Buffer.from('Reporting-MTA: dns; mx.example.net\r\n\r\nFinal-Recipient: rfc822; person@example.com\r\nAction: failed\r\nStatus: 5.1.1\r\n').toString('base64url')}},
        {mimeType: 'text/rfc822-headers', body: {data: Buffer.from(`Message-ID: ${originalRfcMessageId}\r\nSubject: Re: Request\r\n`).toString('base64url')}}
      ]
    }
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
    providerResultId: ['PROVIDER_ACCEPTED', 'RECONCILED'].includes(status) ? 'sent-1' : null,
    providerMessageId: ['PROVIDER_ACCEPTED', 'RECONCILED'].includes(status) ? 'sent-1' : null,
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
  const sent = input.sent ?? gmailMessage('sent-1', providerFinalMessageId);
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
    getSendOperationByProviderMessageId: vi.fn(async (input: {providerMessageId: string}) => current.providerMessageId === input.providerMessageId ? current : null),
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
    const provider = providerFor();
    const service = new GmailSendService(provider, credentials as never, operationStore as never, evidence as never, responsibilities as never);
    const result = await service.dispatch({userId: 'user-1', sendOperationId: 'operation-1'});
    expect(result.status).toBe('RECONCILED');
    expect(operationStore.claimSendOperation).toHaveBeenCalledTimes(1);
    expect(operationStore.transitionSendOperation).toHaveBeenCalledWith(expect.objectContaining({status: 'PROVIDER_ACCEPTED'}));
    expect(evidence.upsertNormalizedMessage).toHaveBeenCalledTimes(1);
    expect(provider.sendMessage).toHaveBeenCalledWith('token', {raw: expect.any(String), threadId: 'thread-1'});
    expect(Object.keys(vi.mocked(provider.sendMessage).mock.calls[0]![1] as object).sort()).toEqual(['raw', 'threadId']);
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
    const state = responsibility([leg('user-send', 'USER', 'REPLY_TO_REQUEST')]);
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
      getResponsibility: vi.fn(async () => ({state, semanticEvidenceRevision: 8})),
      applyTrustedCommand: vi.fn(async () => ({status: 'REJECTED', admission: 'TRACK', reason: 'trusted evidence mismatch', effects: [], responsibilities: [state]}))
    };
    const service = new GmailSendService(provider, credentials as never, operationStore as never, evidence as never, responsibilityStore as never);
    const result = await service.dispatch({userId: 'user-1', sendOperationId: 'operation-1'});
    expect(result.status).toBe('PROVIDER_ACCEPTED');
    expect(result.lastErrorCode).toContain('RESPONSIBILITY_REEVALUATION_REJECTED');
    expect(provider.sendMessage).toHaveBeenCalledTimes(1);
    expect(responsibilityStore.applyTrustedCommand).toHaveBeenCalledTimes(1);
  });

  it('keeps an unknown provider outcome ambiguous without guessing identity or resending', async () => {
    const operationStore = store(operation('AMBIGUOUS'));
    const provider = providerFor({search: ['sent-1']});
    const service = new GmailSendService(provider, credentials as never, operationStore as never, evidence as never, responsibilities as never);
    const result = await service.dispatch({userId: 'user-1', sendOperationId: 'operation-1'});
    expect(result.status).toBe('AMBIGUOUS');
    expect(result.lastErrorCode).toBe('SEND_ACCEPTANCE_UNKNOWN');
    expect(provider.sendMessage).not.toHaveBeenCalled();
    expect(provider.listMessagesByRfc822MessageId).not.toHaveBeenCalled();
    expect(evidence.upsertNormalizedMessage).not.toHaveBeenCalled();
  });

  it('closes only communication legs and never treats artifact-specific SEND as fulfilled by provider acceptance alone', () => {
    const reply = buildTrustedReconciledSendCommand({
      operation: operation('PROVIDER_ACCEPTED'), snapshot: snapshot() as never,
      responsibility: responsibility([leg('user-send', 'USER', 'REPLY_TO_REQUEST')]),
      messageId: 'db-sent-1', evidenceRevision: 8
    });
    expect(reply?.effects?.[0]?.operation).toBe('RESOLVE');

    const artifact = buildTrustedReconciledSendCommand({
      operation: operation('PROVIDER_ACCEPTED'), snapshot: snapshot() as never,
      responsibility: responsibility([leg('artifact-send', 'USER', 'SEND_REVISED_DOCUMENT')]),
      messageId: 'db-sent-1', evidenceRevision: 8
    });
    expect(artifact).toBeUndefined();

    const t04 = buildTrustedReconciledSendCommand({
      operation: operation('PROVIDER_ACCEPTED'), snapshot: snapshot() as never,
      responsibility: responsibility([leg('follow-up', 'USER', 'FOLLOW_UP'), leg('approval', 'OTHER_PARTY', 'APPROVE_REQUEST')]),
      messageId: 'db-sent-1', evidenceRevision: 8
    });
    expect(t04?.effects?.[0]?.operation).toBe('UPDATE');
    expect(t04?.effects?.[0]?.responsibilityRef).toBe('responsibility-1');
    expect(t04?.effects?.[0]?.patch?.obligationLegs?.find((item) => item.id === 'approval')?.status).toBe('OPEN');
  });

  it('accepts a provider-generated Message-ID but refuses the wrong Gmail thread or a missing final Message-ID', async () => {
    const rewrittenStore = store(operation());
    const rewrittenProvider = providerFor({sent: gmailMessage('sent-1', '<gmail-rewritten@mail.gmail.com>')});
    const rewrittenService = new GmailSendService(rewrittenProvider, credentials as never, rewrittenStore as never, evidence as never, responsibilities as never);
    expect((await rewrittenService.dispatch({userId: 'user-1', sendOperationId: 'operation-1'})).status).toBe('RECONCILED');

    vi.clearAllMocks();
    const wrongThreadStore = store(operation());
    const wrongThread = gmailMessage('sent-1', providerFinalMessageId, {threadId: 'wrong-thread'});
    const wrongThreadProvider = providerFor({sent: wrongThread});
    const wrongThreadService = new GmailSendService(wrongThreadProvider, credentials as never, wrongThreadStore as never, evidence as never, responsibilities as never);
    const threadResult = await wrongThreadService.dispatch({userId: 'user-1', sendOperationId: 'operation-1'});
    expect(threadResult.status).toBe('PROVIDER_ACCEPTED');
    expect(threadResult.lastErrorCode).toContain('RECONCILED_THREAD_MISMATCH');

    vi.clearAllMocks();
    const missingIdStore = store(operation());
    const missingId = gmailMessage('sent-1', providerFinalMessageId);
    missingId.payload!.headers = missingId.payload!.headers!.filter((item) => item.name !== 'Message-ID');
    const missingIdProvider = providerFor({sent: missingId});
    const missingIdService = new GmailSendService(missingIdProvider, credentials as never, missingIdStore as never, evidence as never, responsibilities as never);
    const messageResult = await missingIdService.dispatch({userId: 'user-1', sendOperationId: 'operation-1'});
    expect(messageResult.status).toBe('PROVIDER_ACCEPTED');
    expect(messageResult.lastErrorCode).toContain('RECONCILED_MESSAGE_ID_MISSING');
    expect(evidence.upsertNormalizedMessage).not.toHaveBeenCalled();
  });

  it('recognizes only structured failed DSNs with a returned original Message-ID', async () => {
    const original = providerFinalMessageId;
    const failed = await extractGmailFailedDeliveryStatus(failedDsnMessage(original));
    expect(failed).toEqual({
      action: 'FAILED',
      originalMessageId: original,
      observationKey: expect.stringMatching(/^gmail:dsn-failed:[0-9a-f]{64}$/)
    });

    const delayed = failedDsnMessage(original);
    const statusPart = delayed.payload?.parts?.find((part) => part.mimeType === 'message/delivery-status');
    if (statusPart?.body?.data) statusPart.body.data = Buffer.from('Final-Recipient: rfc822; person@example.com\r\nAction: delayed\r\nStatus: 4.2.0\r\n').toString('base64url');
    expect(await extractGmailFailedDeliveryStatus(delayed)).toBeUndefined();

    const unstructured = gmailMessage('fake-bounce', '<fake@example.com>', {labelIds: ['INBOX']});
    expect(await extractGmailFailedDeliveryStatus(unstructured)).toBeUndefined();

    const blocked = failedDsnMessage(original);
    const blockedStatusPart = blocked.payload?.parts?.find((part) => part.mimeType === 'message/delivery-status');
    if (blockedStatusPart) blockedStatusPart.body = {attachmentId: 'dsn-status', size: 100};
    expect(await extractGmailFailedDeliveryStatus(blocked, async () => {
      throw new GmailProviderError(404, 'DSN_PART_UNAVAILABLE');
    })).toBeUndefined();
  });

  it('reopens only the exact leg previously closed by the correlated SendOperation after trusted non-delivery', async () => {
    const send = operation('RECONCILED');
    send.draftSnapshot = {
      ...snapshot(),
      responsibilityBinding: {responsibilityId: 'responsibility-1', aggregateVersion: 7, evidenceRevision: 4}
    };
    const closeEvidence = {
      evidenceKind: 'PROVIDER_RECONCILED_SEND',
      messageId: 'db-sent-1',
      providerObservationKey: 'sent-1',
      sourceLocator: {authorized: true, provider: 'gmail', sendOperationId: send.id}
    };
    const originalLeg = leg('reply-leg', 'USER', 'REPLY_TO_REQUEST');
    const resolved = {
      ...responsibility([]),
      resolutionStatus: 'RESOLVED' as const,
      resolutionReason: 'SATISFIED' as const,
      resolvedAt: '2030-01-01T00:01:00.000Z',
      acceptedEvidenceRevision: 8,
      aggregateVersion: 8,
      obligationLegs: [{...originalLeg, status: 'CLOSED' as const, closureReason: 'SATISFIED' as const, closedAt: '2030-01-01T00:01:00.000Z', provenance: [closeEvidence]}]
    } satisfies ResponsibilityState;
    const deliveryStatus = await extractGmailFailedDeliveryStatus(failedDsnMessage(providerFinalMessageId));
    expect(deliveryStatus).toBeDefined();

    const provider = providerFor({search: ['sent-1'], sent: gmailMessage('sent-1', providerFinalMessageId)});
    const operationStore = store(send);
    const responsibilityStore = {
      getResponsibility: vi.fn(async () => ({state: resolved, projection: {}, semanticEvidenceRevision: 9})),
      applyTrustedCommand: vi.fn(async (command: ReturnType<typeof buildTrustedProviderNonDeliveryCommand>) => ({
        status: 'APPLIED', admission: 'TRACK', reason: 'applied', effects: command?.effects ?? [], responsibilities: []
      }))
    };
    const service = new GmailSendService(provider, credentials as never, operationStore as never, evidence as never, responsibilityStore as never);
    expect(await service.observeProviderNonDelivery({
      userId: 'user-1', connectedAccountId: 'account-1', accessToken: 'token', sourceMessageId: '00000000-0000-4000-8000-000000000001', deliveryStatus: deliveryStatus!
    })).toBe(true);
    const command = responsibilityStore.applyTrustedCommand.mock.calls[0]![0]!;
    expect(command.evidenceRevision).toBe(9);
    expect(command.effects?.[0]?.operation).toBe('REOPEN');
    expect(command.effects?.[0]?.patch?.obligationLegs?.find((item) => item.id === 'reply-leg')?.status).toBe('OPEN');
    expect(command.provenance?.[0]).toEqual(expect.objectContaining({
      evidenceKind: 'PROVIDER_NON_DELIVERY',
      providerObservationKey: deliveryStatus!.observationKey,
      sourceLocator: expect.objectContaining({kind: 'DSN_FAILED', sendOperationId: send.id})
    }));
  });

});
