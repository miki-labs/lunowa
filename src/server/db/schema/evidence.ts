import {sql} from 'drizzle-orm';
import {
  bigint,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid
} from 'drizzle-orm/pg-core';

import {user} from './auth';

const instant = (name: string) =>
  timestamp(name, {withTimezone: true, precision: 3}).notNull().defaultNow();

const optionalInstant = (name: string) =>
  timestamp(name, {withTimezone: true, precision: 3});

const updatedInstant = () =>
  timestamp('updated_at', {withTimezone: true, precision: 3})
    .notNull()
    .defaultNow();

/**
 * Provider credentials are deliberately represented only by an opaque
 * server-side reference. Tokens and provider SDK objects do not belong in
 * this schema or in the normalized evidence boundary.
 */
export const connectedAccounts = pgTable(
  'connected_accounts',
  {
    id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    userId: uuid('user_id').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    emailAddress: text('email_address').notNull(),
    displayName: text('display_name'),
    connectionState: text('connection_state').notNull().default('CONNECTED'),
    grantedCapabilities: jsonb('granted_capabilities')
      .$type<readonly string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    credentialReference: text('credential_reference').notNull(),
    lastSuccessfulSyncAt: optionalInstant('last_successful_sync_at'),
    createdAt: instant('created_at'),
    updatedAt: updatedInstant()
  },
  (table) => [
    unique('connected_accounts_id_user_uq').on(table.id, table.userId),
    unique('connected_accounts_user_provider_account_uq').on(
      table.userId,
      table.provider,
      table.providerAccountId
    ),
    foreignKey({
      name: 'connected_accounts_user_fk',
      columns: [table.userId],
      foreignColumns: [user.id]
    }).onDelete('cascade'),
    check(
      'connected_accounts_provider_nonempty',
      sql`char_length(btrim(${table.provider})) BETWEEN 1 AND 128`
    ),
    check(
      'connected_accounts_provider_account_nonempty',
      sql`char_length(btrim(${table.providerAccountId})) BETWEEN 1 AND 512`
    ),
    check(
      'connected_accounts_email_nonempty',
      sql`char_length(btrim(${table.emailAddress})) BETWEEN 1 AND 320`
    ),
    check(
      'connected_accounts_connection_state_check',
      sql`${table.connectionState} IN ('CONNECTED', 'RECONNECT_REQUIRED', 'DISCONNECTED', 'ERROR')`
    ),
    check(
      'connected_accounts_capabilities_array_check',
      sql`jsonb_typeof(${table.grantedCapabilities}) = 'array'`
    ),
    check(
      'connected_accounts_credential_reference_nonempty',
      sql`char_length(btrim(${table.credentialReference})) BETWEEN 1 AND 1024`
    ),
    index('connected_accounts_user_idx').on(table.userId)
  ]
);

export const providerSyncStates = pgTable(
  'provider_sync_states',
  {
    connectedAccountId: uuid('connected_account_id')
      .notNull()
      .primaryKey()
      .references(() => connectedAccounts.id, {onDelete: 'cascade'}),
    cursorOrDeltaToken: text('cursor_or_delta_token'),
    syncGeneration: bigint('sync_generation', {mode: 'number'})
      .notNull()
      .default(0),
    status: text('status').notNull().default('PENDING'),
    lastAttemptAt: optionalInstant('last_attempt_at'),
    lastSuccessAt: optionalInstant('last_success_at'),
    lastFullReconcileAt: optionalInstant('last_full_reconcile_at'),
    lastErrorCode: text('last_error_code'),
    updatedAt: updatedInstant()
  },
  (table) => [
    check('provider_sync_states_generation_nonnegative', sql`${table.syncGeneration} >= 0`),
    check(
      'provider_sync_states_status_check',
      sql`${table.status} IN ('PENDING', 'SYNCING', 'HEALTHY', 'RECONCILIATION_REQUIRED', 'ERROR')`
    ),
    index('provider_sync_states_status_idx').on(table.status, table.updatedAt)
  ]
);

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    userId: uuid('user_id').notNull(),
    connectedAccountId: uuid('connected_account_id').notNull(),
    providerThreadId: text('provider_thread_id'),
    normalizedSubject: text('normalized_subject'),
    semanticTopic: text('semantic_topic'),
    firstMessageAt: optionalInstant('first_message_at'),
    lastMessageAt: optionalInstant('last_message_at'),
    lastInboundAt: optionalInstant('last_inbound_at'),
    lastOutboundAt: optionalInstant('last_outbound_at'),
    semanticEvidenceRevision: bigint('semantic_evidence_revision', {mode: 'number'})
      .notNull()
      .default(0),
    createdAt: instant('created_at'),
    updatedAt: updatedInstant()
  },
  (table) => [
    unique('conversations_id_account_uq').on(table.id, table.connectedAccountId),
    uniqueIndex('conversations_account_provider_thread_uq')
      .on(table.connectedAccountId, table.providerThreadId)
      .where(sql`${table.providerThreadId} IS NOT NULL`),
    foreignKey({
      name: 'conversations_user_fk',
      columns: [table.userId],
      foreignColumns: [user.id]
    }).onDelete('cascade'),
    foreignKey({
      name: 'conversations_account_owner_fk',
      columns: [table.connectedAccountId, table.userId],
      foreignColumns: [connectedAccounts.id, connectedAccounts.userId]
    }).onDelete('cascade'),
    check(
      'conversations_revision_nonnegative',
      sql`${table.semanticEvidenceRevision} >= 0`
    ),
    index('conversations_account_updated_idx').on(
      table.connectedAccountId,
      table.updatedAt,
      table.id
    ),
    index('conversations_user_updated_idx').on(table.userId, table.updatedAt, table.id)
  ]
);

export const participantIdentities = pgTable(
  'participant_identities',
  {
    id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    userId: uuid('user_id').notNull(),
    canonicalEmail: text('canonical_email').notNull(),
    displayName: text('display_name'),
    organizationName: text('organization_name'),
    lastSeenAt: optionalInstant('last_seen_at'),
    derivedMetadata: jsonb('derived_metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: instant('created_at'),
    updatedAt: updatedInstant()
  },
  (table) => [
    unique('participant_identities_id_user_uq').on(table.id, table.userId),
    unique('participant_identities_user_email_uq').on(
      table.userId,
      table.canonicalEmail
    ),
    foreignKey({
      name: 'participant_identities_user_fk',
      columns: [table.userId],
      foreignColumns: [user.id]
    }).onDelete('cascade'),
    check(
      'participant_identities_canonical_email_check',
      sql`${table.canonicalEmail} = lower(btrim(${table.canonicalEmail})) AND char_length(${table.canonicalEmail}) BETWEEN 3 AND 320`
    ),
    check(
      'participant_identities_metadata_object_check',
      sql`jsonb_typeof(${table.derivedMetadata}) = 'object'`
    ),
    index('participant_identities_user_idx').on(table.userId, table.lastSeenAt)
  ]
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    userId: uuid('user_id').notNull(),
    connectedAccountId: uuid('connected_account_id').notNull(),
    conversationId: uuid('conversation_id').notNull(),
    providerMessageId: text('provider_message_id').notNull(),
    providerThreadId: text('provider_thread_id'),
    direction: text('direction').notNull(),
    senderParticipantId: uuid('sender_participant_id'),
    subject: text('subject').notNull(),
    textBody: text('text_body'),
    sanitizedHtmlBody: text('sanitized_html_body'),
    occurredAt: timestamp('sent_at_or_received_at', {
      withTimezone: true,
      precision: 3
    }).notNull(),
    providerReceivedAt: optionalInstant('provider_received_at'),
    readState: text('read_state'),
    mailboxStateSnapshot: jsonb('mailbox_state_snapshot').$type<Record<string, unknown>>(),
    rawProviderMetadata: jsonb('raw_provider_metadata').$type<Record<string, unknown>>(),
    createdAt: instant('created_at'),
    updatedAt: updatedInstant()
  },
  (table) => [
    unique('messages_id_account_uq').on(table.id, table.connectedAccountId),
    unique('messages_account_provider_message_uq').on(
      table.connectedAccountId,
      table.providerMessageId
    ),
    foreignKey({
      name: 'messages_user_fk',
      columns: [table.userId],
      foreignColumns: [user.id]
    }).onDelete('cascade'),
    foreignKey({
      name: 'messages_account_owner_fk',
      columns: [table.connectedAccountId, table.userId],
      foreignColumns: [connectedAccounts.id, connectedAccounts.userId]
    }).onDelete('cascade'),
    foreignKey({
      name: 'messages_conversation_account_fk',
      columns: [table.conversationId, table.connectedAccountId],
      foreignColumns: [conversations.id, conversations.connectedAccountId]
    }).onDelete('cascade'),
    foreignKey({
      name: 'messages_sender_participant_owner_fk',
      columns: [table.senderParticipantId, table.userId],
      foreignColumns: [participantIdentities.id, participantIdentities.userId]
    }).onDelete('restrict'),
    check(
      'messages_provider_message_nonempty',
      sql`char_length(btrim(${table.providerMessageId})) BETWEEN 1 AND 1024`
    ),
    check(
      'messages_direction_check',
      sql`${table.direction} IN ('INBOUND', 'OUTBOUND')`
    ),
    index('messages_conversation_occurred_idx').on(
      table.conversationId,
      table.occurredAt,
      table.id
    ),
    index('messages_account_occurred_idx').on(
      table.connectedAccountId,
      table.occurredAt,
      table.id
    )
  ]
);

/**
 * A normalized recipient/cc/bcc edge keeps every participant reference
 * tenant-owned while leaving Person/CRM projection out of this foundation.
 */
export const messageParticipants = pgTable(
  'message_participants',
  {
    id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    userId: uuid('user_id').notNull(),
    connectedAccountId: uuid('connected_account_id').notNull(),
    messageId: uuid('message_id').notNull(),
    participantId: uuid('participant_id').notNull(),
    role: text('role').notNull(),
    createdAt: instant('created_at')
  },
  (table) => [
    unique('message_participants_message_participant_role_uq').on(
      table.messageId,
      table.participantId,
      table.role
    ),
    foreignKey({
      name: 'message_participants_user_fk',
      columns: [table.userId],
      foreignColumns: [user.id]
    }).onDelete('cascade'),
    foreignKey({
      name: 'message_participants_account_owner_fk',
      columns: [table.connectedAccountId, table.userId],
      foreignColumns: [connectedAccounts.id, connectedAccounts.userId]
    }).onDelete('cascade'),
    foreignKey({
      name: 'message_participants_message_account_fk',
      columns: [table.messageId, table.connectedAccountId],
      foreignColumns: [messages.id, messages.connectedAccountId]
    }).onDelete('cascade'),
    foreignKey({
      name: 'message_participants_participant_owner_fk',
      columns: [table.participantId, table.userId],
      foreignColumns: [participantIdentities.id, participantIdentities.userId]
    }).onDelete('restrict'),
    check(
      'message_participants_role_check',
      sql`${table.role} IN ('TO', 'CC', 'BCC')`
    ),
    index('message_participants_participant_idx').on(
      table.participantId,
      table.messageId
    )
  ]
);

export const attachments = pgTable(
  'attachments',
  {
    id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    userId: uuid('user_id').notNull(),
    connectedAccountId: uuid('connected_account_id').notNull(),
    messageId: uuid('message_id').notNull(),
    providerAttachmentId: text('provider_attachment_id'),
    filename: text('filename').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: integer('size_bytes'),
    contentDisposition: text('content_disposition'),
    contentReference: text('content_reference').notNull(),
    contentHash: text('content_hash'),
    previewState: text('preview_state'),
    createdAt: instant('created_at'),
    updatedAt: updatedInstant()
  },
  (table) => [
    uniqueIndex('attachments_message_provider_attachment_uq')
      .on(table.messageId, table.providerAttachmentId)
      .where(sql`${table.providerAttachmentId} IS NOT NULL`),
    foreignKey({
      name: 'attachments_user_fk',
      columns: [table.userId],
      foreignColumns: [user.id]
    }).onDelete('cascade'),
    foreignKey({
      name: 'attachments_account_owner_fk',
      columns: [table.connectedAccountId, table.userId],
      foreignColumns: [connectedAccounts.id, connectedAccounts.userId]
    }).onDelete('cascade'),
    foreignKey({
      name: 'attachments_message_account_fk',
      columns: [table.messageId, table.connectedAccountId],
      foreignColumns: [messages.id, messages.connectedAccountId]
    }).onDelete('cascade'),
    check(
      'attachments_size_nonnegative',
      sql`${table.sizeBytes} IS NULL OR ${table.sizeBytes} >= 0`
    ),
    check(
      'attachments_filename_nonempty',
      sql`char_length(btrim(${table.filename})) BETWEEN 1 AND 1024`
    ),
    check(
      'attachments_mime_type_nonempty',
      sql`char_length(btrim(${table.mimeType})) BETWEEN 1 AND 255`
    ),
    check(
      'attachments_content_reference_nonempty',
      sql`char_length(btrim(${table.contentReference})) BETWEEN 1 AND 2048`
    ),
    index('attachments_message_idx').on(table.messageId, table.id)
  ]
);

export const evidenceSchema = {
  connectedAccounts,
  providerSyncStates,
  conversations,
  participantIdentities,
  messages,
  messageParticipants,
  attachments
};
