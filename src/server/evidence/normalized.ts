export type JsonObject = Record<string, unknown>;

export type NormalizedParticipant = {
  email: string;
  displayName?: string;
  organizationName?: string;
  derivedMetadata?: JsonObject;
};

export type NormalizedAttachment = {
  id?: string;
  providerAttachmentId?: string;
  filename: string;
  mimeType: string;
  sizeBytes?: number;
  contentDisposition?: string;
  contentReference: string;
  contentHash?: string;
  previewState?: string;
};

export type NormalizedConversation = {
  id: string;
  providerThreadId?: string;
  normalizedSubject?: string;
  semanticTopic?: string;
};

/**
 * The only message input accepted by the evidence repository. Keeping this
 * contract independent of Gmail prevents provider SDK types from crossing
 * into the application persistence boundary.
 */
export type NormalizedProviderMessage = {
  userId: string;
  connectedAccountId: string;
  conversation: NormalizedConversation;
  providerMessageId: string;
  providerThreadId?: string;
  direction: 'INBOUND' | 'OUTBOUND';
  sender: NormalizedParticipant;
  recipients: readonly NormalizedParticipant[];
  cc?: readonly NormalizedParticipant[];
  bcc?: readonly NormalizedParticipant[];
  subject: string;
  textBody?: string;
  sanitizedHtmlBody?: string;
  occurredAt: Date;
  providerReceivedAt?: Date;
  readState?: string;
  mailboxStateSnapshot?: JsonObject;
  rawProviderMetadata?: JsonObject;
  attachments?: readonly NormalizedAttachment[];
};

export type NormalizedConnectedAccount = {
  userId: string;
  provider: string;
  providerAccountId: string;
  emailAddress: string;
  displayName?: string;
  connectionState?: 'CONNECTED' | 'RECONNECT_REQUIRED' | 'DISCONNECTED' | 'ERROR';
  grantedCapabilities?: readonly string[];
  credentialReference: string;
};

export type ProviderSyncStateInput = {
  userId: string;
  connectedAccountId: string;
  cursorOrDeltaToken?: string;
  syncGeneration?: number;
  status?: 'PENDING' | 'SYNCING' | 'HEALTHY' | 'RECONCILIATION_REQUIRED' | 'ERROR';
  lastAttemptAt?: Date;
  lastSuccessAt?: Date;
  lastFullReconcileAt?: Date;
  lastErrorCode?: string;
};

export function canonicalizeParticipant(
  participant: NormalizedParticipant
): NormalizedParticipant & {canonicalEmail: string} {
  const canonicalEmail = participant.email.trim().toLowerCase();
  if (canonicalEmail.length < 3 || canonicalEmail.length > 320 || !canonicalEmail.includes('@')) {
    throw new Error('participant email must be a canonical email address');
  }

  return {
    ...participant,
    canonicalEmail,
    displayName: participant.displayName?.trim() || undefined,
    organizationName: participant.organizationName?.trim() || undefined
  };
}
