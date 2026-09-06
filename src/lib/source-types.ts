export type SourceReadiness = 'loading' | 'partial' | 'ready' | 'degraded' | 'unavailable';

export type SourceAccountReadModel = {
  id: string;
  provider: string;
  providerAccountId: string;
  emailAddress: string;
  displayName: string | null;
  connectionState: string;
  sync: {
    status: string;
    lastSuccessAt: string | null;
    lastFullReconcileAt: string | null;
    dataThroughAt: string | null;
    errorCode: string | null;
  };
};

export type SourceParticipantReadModel = {
  email: string;
  displayName: string | null;
};

export type SourceAttachmentReadModel = {
  id: string;
  providerAttachmentId: string | null;
  filename: string;
  mimeType: string;
  sizeBytes: number | null;
  contentDisposition: string | null;
  contentReference: string;
  contentHash: string | null;
  previewState: string | null;
};

export type SourceConversationSummary = {
  id: string;
  providerThreadId: string | null;
  subject: string;
  preview: string;
  lastMessageAt: string | null;
  messageCount: number;
  hasAttachments: boolean;
  account: SourceAccountReadModel;
  latestSender: SourceParticipantReadModel | null;
};

export type SourceMessageReadModel = {
  id: string;
  providerMessageId: string;
  providerThreadId: string | null;
  direction: 'INBOUND' | 'OUTBOUND';
  sender: SourceParticipantReadModel;
  recipients: SourceParticipantReadModel[];
  cc: SourceParticipantReadModel[];
  bcc: SourceParticipantReadModel[];
  subject: string;
  textBody: string | null;
  sanitizedHtmlBody: string | null;
  occurredAt: string;
  providerReceivedAt: string | null;
  readState: string | null;
  providerDeletedAt: string | null;
  attachments: SourceAttachmentReadModel[];
};

export type SourceConversationReadModel = {
  id: string;
  providerThreadId: string | null;
  subject: string;
  account: SourceAccountReadModel;
  evidenceRevision: number;
  messages: SourceMessageReadModel[];
};

export type SourcePageReadModel = {
  accounts: SourceAccountReadModel[];
  conversations: SourceConversationSummary[];
  readiness: SourceReadiness;
  dataThroughAt: string | null;
  query: {
    text: string;
    accountId: string | null;
    sender: string | null;
    from: string | null;
    to: string | null;
  };
  total: number;
  nextCursor: string | null;
};
