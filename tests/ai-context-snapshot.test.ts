import {describe, expect, it} from 'vitest';

import {AIInterpretationRunRepository} from '@/server/db/repositories/ai';

const messageId = 'message-1';
const senderId = 'sender-1';
const recipientId = 'recipient-1';
const body = '本文の現在部分です。';

function chain<T>(value: T) {
  const query = {
    from: () => query,
    innerJoin: () => query,
    where: () => query,
    orderBy: () => query,
    limit: async () => value,
    then: (resolve: (value: T) => unknown, reject?: (reason: unknown) => unknown) => Promise.resolve(value).then(resolve, reject)
  };
  return query;
}

describe('AI production context snapshot boundary', () => {
  it('keeps revision, body, and run manifest on one snapshot when evidence arrives concurrently', async () => {
    let currentRevision = 1;
    let currentBody = body;
    let snapshotRevision = 1;
    let snapshotBody = body;
    let selectCount = 0;
    let isolationSet = false;
    let insertedManifest: Record<string, unknown> | undefined;

    const db = {
      transaction: async (work: (tx: unknown) => Promise<unknown>) => work({
        execute: async () => {
          isolationSet = true;
          snapshotRevision = currentRevision;
          snapshotBody = currentBody;
          // A concurrent evidence transaction commits after this snapshot is
          // established. The repeatable-read transaction must not mix it in.
          currentRevision = 2;
          currentBody = '到着した新しい本文です。';
        },
        select: () => {
          selectCount += 1;
          if (selectCount === 1) return chain([{id: 'account-1', provider: 'gmail', emailAddress: 'user@example.com', ownerId: 'user-1', ownerEmail: 'user@example.com'}]);
          if (selectCount === 2) return chain([{id: 'conversation-1', semanticEvidenceRevision: snapshotRevision}]);
          if (selectCount === 3) return chain([{
            id: messageId, userId: 'user-1', connectedAccountId: 'account-1', conversationId: 'conversation-1',
            providerMessageId: 'provider-1', providerThreadId: null, direction: 'INBOUND', senderParticipantId: senderId,
            subject: '確認', textBody: snapshotBody, sanitizedHtmlBody: null, occurredAt: new Date('2026-09-07T00:00:00Z'),
            providerReceivedAt: null, readState: null, mailboxStateSnapshot: null, rawProviderMetadata: null,
            providerDeletedAt: null, createdAt: new Date('2026-09-07T00:00:00Z'), updatedAt: new Date('2026-09-07T00:00:00Z')
          }]);
          if (selectCount === 4) return chain([{messageId, role: 'TO', participantId: recipientId, email: 'user@example.com', displayName: null}]);
          return chain([{participantId: senderId, email: 'partner@example.com', displayName: 'Partner'}]);
        },
        insert: () => ({
          values: (value: {contextManifest: Record<string, unknown>}) => ({
            returning: async () => {
              insertedManifest = value.contextManifest;
              return [{id: 'run-1'}];
            }
          })
        })
      })
    };

    const repository = new AIInterpretationRunRepository(db as never, ({messages}) => new Map(
      messages.map((message) => [message.id, [{zone: 'AUTHORED_CURRENT' as const, start: 0, end: message.body.length}]])
    ));
    const captured = await repository.captureInterpretation({
      userId: 'user-1', connectedAccountId: 'account-1', conversationId: 'conversation-1',
      sourceEventKey: 'message-1-revision-1', focalMessageId: messageId, messageIds: [messageId]
    }, {model: 'gpt-5.6', modelConfigVersion: 'g70-test-v1', dataControlMode: 'STANDARD_API_RETENTION'});

    expect(isolationSet).toBe(true);
    expect(captured.context.evidenceRevision).toBe(1);
    expect(captured.context.messages[0]?.body).toBe(body);
    expect(captured.built.manifest.messageIds).toEqual([messageId]);
    expect(insertedManifest).toMatchObject({basisEvidenceRevision: 1, messageIds: [messageId], focalMessageId: messageId});
    expect(currentRevision).toBe(2);
    expect(currentBody).not.toBe(captured.context.messages[0]?.body);

    const request = {userId: 'user-1', connectedAccountId: 'account-1', conversationId: 'conversation-1', sourceEventKey: 'scope-check', focalMessageId: messageId};
    await expect(repository.captureInterpretation({...request, messageIds: []}, {model: 'gpt-5.6', modelConfigVersion: 'g70-test-v1', dataControlMode: 'STANDARD_API_RETENTION'})).rejects.toThrow('unique message scope');
    await expect(repository.captureInterpretation({...request, messageIds: [messageId, messageId]}, {model: 'gpt-5.6', modelConfigVersion: 'g70-test-v1', dataControlMode: 'STANDARD_API_RETENTION'})).rejects.toThrow('unique message scope');
    await expect(repository.captureInterpretation({...request, focalMessageId: 'message-2', messageIds: [messageId]}, {model: 'gpt-5.6', modelConfigVersion: 'g70-test-v1', dataControlMode: 'STANDARD_API_RETENTION'})).rejects.toThrow('unique message scope');
    await expect(repository.captureInterpretation({...request, messageIds: undefined} as never, {model: 'gpt-5.6', modelConfigVersion: 'g70-test-v1', dataControlMode: 'STANDARD_API_RETENTION'})).rejects.toThrow('unique message scope');
  });
});
