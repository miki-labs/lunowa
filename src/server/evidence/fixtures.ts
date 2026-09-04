import type {NormalizedProviderMessage} from './normalized';

const fixtureConversationId = '00000000-0000-4000-8000-000000000003';

/**
 * A deterministic normalized message fixture for domain/repository tests.
 * It intentionally contains no Gmail payload or provider SDK type.
 */
export function normalizedEvidenceFixture(
  userId: string,
  connectedAccountId: string,
  overrides: Partial<NormalizedProviderMessage> = {}
): NormalizedProviderMessage {
  return {
    userId,
    connectedAccountId,
    conversation: {
      id: fixtureConversationId,
      providerThreadId: 'provider-thread-001',
      normalizedSubject: 'project status',
      semanticTopic: 'project status'
    },
    providerMessageId: 'provider-message-001',
    providerThreadId: 'provider-thread-001',
    direction: 'INBOUND',
    sender: {
      email: 'sender@example.com',
      displayName: 'Sender'
    },
    recipients: [{email: 'owner@example.com', displayName: 'Owner'}],
    cc: [],
    bcc: [],
    subject: 'Project status',
    textBody: 'The current status is ready for review.',
    sanitizedHtmlBody: '<p>The current status is ready for review.</p>',
    occurredAt: new Date('2026-01-02T03:04:05.000Z'),
    providerReceivedAt: new Date('2026-01-02T03:04:06.000Z'),
    readState: 'UNREAD',
    mailboxStateSnapshot: {inbox: true},
    rawProviderMetadata: {providerLabel: 'fixture'},
    attachments: [
      {
        providerAttachmentId: 'provider-attachment-001',
        filename: 'status.txt',
        mimeType: 'text/plain',
        sizeBytes: 12,
        contentDisposition: 'attachment',
        contentReference: 'provider:attachment:001',
        contentHash: 'sha256:fixture',
        previewState: 'AVAILABLE'
      }
    ],
    ...overrides
  };
}
