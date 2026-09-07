import {sql} from 'drizzle-orm';
import {check, foreignKey, index, integer, jsonb, pgTable, text, timestamp, unique, uuid} from 'drizzle-orm/pg-core';

import {user} from './auth';
import {connectedAccounts, conversations, messages} from './evidence';

const instant = (name: string) => timestamp(name, {withTimezone: true, precision: 3}).notNull().defaultNow();
export const drafts = pgTable(
  'drafts',
  {
    id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    userId: uuid('user_id').notNull(),
    connectedAccountId: uuid('connected_account_id').notNull(),
    conversationId: uuid('conversation_id'),
    inReplyToMessageId: uuid('in_reply_to_message_id'),
    mode: text('mode').notNull(),
    recipients: jsonb('recipients').$type<readonly {email: string; displayName: string | null}[]>().notNull(),
    cc: jsonb('cc').$type<readonly {email: string; displayName: string | null}[]>().notNull(),
    bcc: jsonb('bcc').$type<readonly {email: string; displayName: string | null}[]>().notNull(),
    subject: text('subject').notNull(),
    bodyFormat: text('body_format').notNull().default('TEXT'),
    body: text('body').notNull().default(''),
    replyContext: jsonb('reply_context').$type<Record<string, unknown>>().notNull(),
    status: text('status').notNull().default('ACTIVE'),
    version: integer('version').notNull().default(1),
    createdAt: instant('created_at'),
    updatedAt: instant('updated_at')
  },
  (table) => [
    unique('drafts_id_user_uq').on(table.id, table.userId),
    foreignKey({name: 'drafts_user_fk', columns: [table.userId], foreignColumns: [user.id]}).onDelete('cascade'),
    foreignKey({
      name: 'drafts_account_owner_fk',
      columns: [table.connectedAccountId, table.userId],
      foreignColumns: [connectedAccounts.id, connectedAccounts.userId]
    }).onDelete('cascade'),
    foreignKey({
      name: 'drafts_conversation_account_fk',
      columns: [table.conversationId, table.connectedAccountId],
      foreignColumns: [conversations.id, conversations.connectedAccountId]
    }).onDelete('cascade'),
    foreignKey({
      name: 'drafts_reply_message_account_fk',
      columns: [table.inReplyToMessageId, table.connectedAccountId],
      foreignColumns: [messages.id, messages.connectedAccountId]
    }).onDelete('restrict'),
    check('drafts_mode_check', sql`${table.mode} IN ('REPLY', 'REPLY_ALL')`),
    check('drafts_body_format_check', sql`${table.bodyFormat} = 'TEXT'`),
    check('drafts_status_check', sql`${table.status} IN ('ACTIVE', 'DISCARDED')`),
    check('drafts_version_check', sql`${table.version} >= 1`),
    check('drafts_recipients_array_check', sql`jsonb_typeof(${table.recipients}) = 'array'`),
    check('drafts_cc_array_check', sql`jsonb_typeof(${table.cc}) = 'array'`),
    check('drafts_bcc_array_check', sql`jsonb_typeof(${table.bcc}) = 'array'`),
    check('drafts_reply_context_object_check', sql`jsonb_typeof(${table.replyContext}) = 'object'`),
    index('drafts_user_updated_idx').on(table.userId, table.updatedAt, table.id)
  ]
);

export const sendOperations = pgTable(
  'send_operations',
  {
    id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    userId: uuid('user_id').notNull(),
    draftId: uuid('draft_id').notNull(),
    connectedAccountId: uuid('connected_account_id').notNull(),
    idempotencyKey: text('idempotency_key').notNull(),
    kind: text('kind').notNull().default('IMMEDIATE'),
    status: text('status').notNull().default('PENDING'),
    draftSnapshot: jsonb('draft_snapshot').$type<Record<string, unknown>>().notNull(),
    providerResultId: text('provider_result_id'),
    providerMessageId: text('provider_message_id'),
    attemptCount: integer('attempt_count').notNull().default(0),
    lastErrorCode: text('last_error_code'),
    createdAt: instant('created_at'),
    updatedAt: instant('updated_at')
  },
  (table) => [
    unique('send_operations_id_user_uq').on(table.id, table.userId),
    unique('send_operations_user_idempotency_uq').on(table.userId, table.idempotencyKey),
    foreignKey({name: 'send_operations_user_fk', columns: [table.userId], foreignColumns: [user.id]}).onDelete('cascade'),
    foreignKey({
      name: 'send_operations_draft_user_fk',
      columns: [table.draftId, table.userId],
      foreignColumns: [drafts.id, drafts.userId]
    }).onDelete('restrict'),
    foreignKey({
      name: 'send_operations_account_owner_fk',
      columns: [table.connectedAccountId, table.userId],
      foreignColumns: [connectedAccounts.id, connectedAccounts.userId]
    }).onDelete('restrict'),
    check('send_operations_key_check', sql`char_length(btrim(${table.idempotencyKey})) BETWEEN 1 AND 128`),
    check('send_operations_kind_check', sql`${table.kind} = 'IMMEDIATE'`),
    check('send_operations_status_check', sql`${table.status} IN ('PENDING', 'DISPATCHING', 'AMBIGUOUS', 'PROVIDER_ACCEPTED', 'RECONCILED', 'FAILED')`),
    check('send_operations_snapshot_object_check', sql`jsonb_typeof(${table.draftSnapshot}) = 'object'`),
    check('send_operations_attempt_count_check', sql`${table.attemptCount} >= 0`),
    index('send_operations_draft_idx').on(table.draftId, table.createdAt),
    index('send_operations_pending_idx').on(table.status, table.updatedAt)
  ]
);

export const communicationSchema = {drafts, sendOperations};
