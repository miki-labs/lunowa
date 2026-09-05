import {sql} from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid
} from 'drizzle-orm/pg-core';

import {user} from './auth';
import {connectedAccounts} from './evidence';

const instant = (name: string) =>
  timestamp(name, {withTimezone: true, precision: 3}).notNull().defaultNow();
const optionalInstant = (name: string) =>
  timestamp(name, {withTimezone: true, precision: 3});

/** Ciphertext is the only durable token representation. The key is a runtime secret. */
export const gmailProviderCredentials = pgTable(
  'gmail_provider_credentials',
  {
    id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    userId: uuid('user_id').notNull(),
    connectedAccountId: uuid('connected_account_id').notNull(),
    encryptedPayload: text('encrypted_payload').notNull(),
    keyVersion: text('key_version').notNull(),
    grantedScopes: jsonb('granted_scopes')
      .$type<readonly string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    invalidatedAt: optionalInstant('invalidated_at'),
    createdAt: instant('created_at'),
    updatedAt: instant('updated_at')
  },
  (table) => [
    unique('gmail_provider_credentials_account_uq').on(table.connectedAccountId),
    foreignKey({
      name: 'gmail_provider_credentials_user_fk',
      columns: [table.userId],
      foreignColumns: [user.id]
    }).onDelete('cascade'),
    foreignKey({
      name: 'gmail_provider_credentials_account_owner_fk',
      columns: [table.connectedAccountId, table.userId],
      foreignColumns: [connectedAccounts.id, connectedAccounts.userId]
    }).onDelete('cascade'),
    check(
      'gmail_provider_credentials_ciphertext_nonempty',
      sql`char_length(${table.encryptedPayload}) BETWEEN 32 AND 32768`
    ),
    check(
      'gmail_provider_credentials_scopes_array_check',
      sql`jsonb_typeof(${table.grantedScopes}) = 'array'`
    )
  ]
);

/** OAuth state is hashed for lookup; its PKCE verifier is encrypted at rest. */
export const gmailOauthStates = pgTable(
  'gmail_oauth_states',
  {
    stateDigest: text('state_digest').primaryKey(),
    userId: uuid('user_id').notNull(),
    encryptedCodeVerifier: text('encrypted_code_verifier').notNull(),
    returnPath: text('return_path').notNull(),
    expiresAt: timestamp('expires_at', {withTimezone: true, precision: 3}).notNull(),
    consumedAt: optionalInstant('consumed_at'),
    createdAt: instant('created_at')
  },
  (table) => [
    foreignKey({
      name: 'gmail_oauth_states_user_fk',
      columns: [table.userId],
      foreignColumns: [user.id]
    }).onDelete('cascade'),
    check('gmail_oauth_states_digest_nonempty', sql`char_length(${table.stateDigest}) = 64`),
    check(
      'gmail_oauth_states_return_path_check',
      sql`${table.returnPath} LIKE '/%' AND ${table.returnPath} NOT LIKE '//%'`
    ),
    index('gmail_oauth_states_expiry_idx').on(table.expiresAt)
  ]
);

/** Durable signals never become mailbox truth; workers reconcile them through Gmail. */
export const gmailSyncSignals = pgTable(
  'gmail_sync_signals',
  {
    id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    connectedAccountId: uuid('connected_account_id')
      .notNull()
      .references(() => connectedAccounts.id, {onDelete: 'cascade'}),
    deliveryKey: text('delivery_key').notNull(),
    reason: text('reason').notNull(),
    hintedHistoryId: text('hinted_history_id'),
    status: text('status').notNull().default('PENDING'),
    attempts: integer('attempts').notNull().default(0),
    availableAt: instant('available_at'),
    lockedUntil: optionalInstant('locked_until'),
    lastErrorCode: text('last_error_code'),
    receivedAt: instant('received_at'),
    completedAt: optionalInstant('completed_at')
  },
  (table) => [
    unique('gmail_sync_signals_delivery_uq').on(table.deliveryKey),
    check(
      'gmail_sync_signals_reason_check',
      sql`${table.reason} IN ('INITIAL', 'PUSH', 'SAFETY', 'WATCH_RENEWAL', 'RETRY')`
    ),
    check(
      'gmail_sync_signals_status_check',
      sql`${table.status} IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')`
    ),
    check('gmail_sync_signals_attempts_nonnegative', sql`${table.attempts} >= 0`),
    index('gmail_sync_signals_claim_idx').on(table.status, table.availableAt, table.receivedAt),
    index('gmail_sync_signals_account_idx').on(table.connectedAccountId, table.receivedAt)
  ]
);

export const gmailWatchStates = pgTable(
  'gmail_watch_states',
  {
    connectedAccountId: uuid('connected_account_id')
      .notNull()
      .primaryKey()
      .references(() => connectedAccounts.id, {onDelete: 'cascade'}),
    topicName: text('topic_name').notNull(),
    expirationAt: timestamp('expiration_at', {withTimezone: true, precision: 3}).notNull(),
    lastHistoryId: text('last_history_id').notNull(),
    updatedAt: instant('updated_at')
  },
  (table) => [
    check('gmail_watch_states_topic_nonempty', sql`char_length(btrim(${table.topicName})) > 0`),
    index('gmail_watch_states_expiration_idx').on(table.expirationAt)
  ]
);

/**
 * A bounded bootstrap resumes page-by-page and never turns partial historical
 * coverage into a healthy cursor. pageOffset permits a hard per-run bound even
 * when a provider page straddles that bound.
 */
export const gmailBootstrapStates = pgTable(
  'gmail_bootstrap_states',
  {
    connectedAccountId: uuid('connected_account_id')
      .notNull()
      .primaryKey()
      .references(() => connectedAccounts.id, {onDelete: 'cascade'}),
    baselineHistoryId: text('baseline_history_id').notNull(),
    pageToken: text('page_token'),
    pageOffset: integer('page_offset').notNull().default(0),
    processedMessageCount: integer('processed_message_count').notNull().default(0),
    createdAt: instant('created_at'),
    updatedAt: instant('updated_at')
  },
  (table) => [
    check('gmail_bootstrap_states_history_id_check', sql`${table.baselineHistoryId} ~ '^[0-9]+$'`),
    check('gmail_bootstrap_states_page_offset_check', sql`${table.pageOffset} >= 0`),
    check('gmail_bootstrap_states_processed_check', sql`${table.processedMessageCount} >= 0`),
    index('gmail_bootstrap_states_updated_idx').on(table.updatedAt)
  ]
);

export const gmailSchema = {
  gmailProviderCredentials,
  gmailOauthStates,
  gmailSyncSignals,
  gmailWatchStates,
  gmailBootstrapStates
};
