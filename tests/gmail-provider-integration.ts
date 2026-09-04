import {randomBytes, randomUUID} from 'node:crypto';
import {resolve} from 'node:path';

import {drizzle} from 'drizzle-orm/node-postgres';
import {migrate} from 'drizzle-orm/node-postgres/migrator';
import {Pool} from 'pg';

import {EvidenceRepository} from '../src/server/db/repositories/evidence';
import {GmailRepository} from '../src/server/db/repositories/gmail';
import * as databaseSchema from '../src/server/db/schema';
import {
  conversations,
  gmailBootstrapStates,
  gmailProviderCredentials,
  messages,
  providerSyncStates,
  responsibilities,
  user
} from '../src/server/db/schema';
import {GmailCredentialCipher} from '../src/server/gmail/crypto';
import {GMAIL_READONLY_SCOPE, type GmailTokenSet} from '../src/server/gmail/types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const databaseUrl = process.env.G20_DATABASE_URL;
assert(databaseUrl, 'G20_DATABASE_URL is required; no mock or fallback database is accepted.');

const pool = new Pool({
  connectionString: databaseUrl,
  max: 4,
  application_name: 'lunowa-g20-gmail-provider'
});
const db = drizzle(pool, {schema: databaseSchema});

try {
  const preexisting = await pool.query<{table_name: string}>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  assert(preexisting.rowCount === 0, 'G20 integration requires a clean PostgreSQL database.');
  await migrate(db, {migrationsFolder: resolve(import.meta.dirname, '../drizzle/migrations')});
  const version = await pool.query<{server_version_num: string}>(
    "SELECT current_setting('server_version_num') AS server_version_num"
  );
  assert(version.rows[0]?.server_version_num === '180006', 'G20 integration requires PostgreSQL 18.6.');
  const productionTables = await pool.query<{table_name: string}>(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = ANY($1::text[])
  `, [[
    'gmail_bootstrap_states', 'gmail_oauth_states', 'gmail_provider_credentials',
    'gmail_sync_signals', 'gmail_watch_states', 'messages', 'responsibilities'
  ]]);
  assert(productionTables.rowCount === 7, 'combined G19/G30/G20 production migration topology is incomplete');

  const ownerId = randomUUID();
  const otherUserId = randomUUID();
  await db.insert(user).values([
    {id: ownerId, name: 'G20 owner', email: `g20-${ownerId}@example.invalid`},
    {id: otherUserId, name: 'G20 other', email: `g20-${otherUserId}@example.invalid`}
  ]);

  const evidence = new EvidenceRepository(db);
  const gmail = new GmailRepository(db);
  const accountId = await evidence.upsertConnectedAccount({
    userId: ownerId,
    provider: 'gmail',
    providerAccountId: 'owner@example.com',
    emailAddress: 'owner@example.com',
    credentialReference: `gmail-credential:${randomUUID()}`,
    grantedCapabilities: ['mail_read', 'incremental_sync', 'attachment_fetch']
  });
  await evidence.upsertProviderSyncState({
    userId: ownerId,
    connectedAccountId: accountId,
    status: 'PENDING',
    syncGeneration: 0
  });

  const cipher = new GmailCredentialCipher(randomBytes(32).toString('base64'));
  const token: GmailTokenSet = {
    accessToken: `access-${randomUUID()}`,
    refreshToken: `refresh-${randomUUID()}`,
    expiresAt: Date.now() + 3600_000,
    tokenType: 'Bearer'
  };
  const encryptedPayload = cipher.encrypt(token, `gmail-token:${ownerId}:${accountId}`);
  await gmail.putCredential({
    userId: ownerId,
    connectedAccountId: accountId,
    encryptedPayload,
    keyVersion: 'integration-v1',
    grantedScopes: [GMAIL_READONLY_SCOPE]
  });

  const persisted = await db.select({encryptedPayload: gmailProviderCredentials.encryptedPayload})
    .from(gmailProviderCredentials);
  assert(persisted.length === 1, 'one encrypted credential row was not persisted');
  assert(!persisted[0]!.encryptedPayload.includes(token.accessToken), 'access token was stored in plaintext');
  assert(!persisted[0]!.encryptedPayload.includes(token.refreshToken), 'refresh token was stored in plaintext');
  assert(await gmail.getOwnedCredential(ownerId, accountId), 'owner could not retrieve credential ciphertext');
  assert((await gmail.getOwnedCredential(otherUserId, accountId)) === null, 'cross-user credential lookup succeeded');

  try {
    await gmail.putCredential({
      userId: otherUserId,
      connectedAccountId: accountId,
      encryptedPayload: cipher.encrypt(token, `gmail-token:${otherUserId}:${accountId}`),
      keyVersion: 'integration-v1',
      grantedScopes: [GMAIL_READONLY_SCOPE]
    });
    throw new Error('cross-user credential overwrite succeeded');
  } catch (error) {
    assert(
      error instanceof Error && error.message === 'connected account is not owned by the current user',
      'cross-user credential overwrite did not fail at the ownership boundary'
    );
  }

  const firstSignal = await gmail.enqueueSignal({
    connectedAccountId: accountId,
    deliveryKey: 'pubsub:account:delivery',
    reason: 'PUSH',
    hintedHistoryId: '100'
  });
  const duplicateSignal = await gmail.enqueueSignal({
    connectedAccountId: accountId,
    deliveryKey: 'pubsub:account:delivery',
    reason: 'PUSH',
    hintedHistoryId: '101'
  });
  assert(firstSignal && !duplicateSignal, 'durable Pub/Sub delivery deduplication failed');

  await gmail.saveBootstrapState({
    connectedAccountId: accountId,
    baselineHistoryId: '90',
    pageToken: 'opaque-page-token',
    pageOffset: 17,
    processedMessageCount: 250
  });
  const bootstrap = await gmail.getBootstrapState(accountId);
  assert(
    bootstrap?.baselineHistoryId === '90' && bootstrap.pageOffset === 17 && bootstrap.processedMessageCount === 250,
    'bounded bootstrap reconciliation state was not durable'
  );
  const beforeCursor = await db.select({cursor: providerSyncStates.cursorOrDeltaToken})
    .from(providerSyncStates);
  assert(beforeCursor[0]?.cursor === null, 'partial bootstrap falsely published a healthy cursor');

  const conversationId = randomUUID();
  const source = {
    userId: ownerId,
    connectedAccountId: accountId,
    conversation: {id: conversationId, providerThreadId: 'thread-1'},
    providerMessageId: 'message-1',
    providerThreadId: 'thread-1',
    direction: 'INBOUND' as const,
    sender: {email: 'sender@example.com'},
    recipients: [{email: 'owner@example.com'}],
    subject: 'Observed immutable evidence',
    textBody: 'Provider deletion must not erase this body.',
    occurredAt: new Date('2026-09-04T00:00:00Z')
  };
  await evidence.upsertNormalizedMessage(source);
  const beforeAbsence = await db.select({revision: conversations.semanticEvidenceRevision})
    .from(conversations);
  const firstAbsence = await evidence.markNormalizedMessageAbsent({
    userId: ownerId,
    connectedAccountId: accountId,
    providerMessageId: source.providerMessageId
  });
  const duplicateAbsence = await evidence.markNormalizedMessageAbsent({
    userId: ownerId,
    connectedAccountId: accountId,
    providerMessageId: source.providerMessageId
  });
  const tombstoned = await db.select({
    subject: messages.subject,
    textBody: messages.textBody,
    providerDeletedAt: messages.providerDeletedAt
  }).from(messages);
  assert(
    firstAbsence && !duplicateAbsence &&
    tombstoned[0]?.subject === source.subject &&
      tombstoned[0]?.textBody === source.textBody &&
      tombstoned[0]?.providerDeletedAt instanceof Date,
    'provider deletion erased immutable communication evidence instead of tombstoning it'
  );
  const afterAbsence = await db.select({revision: conversations.semanticEvidenceRevision})
    .from(conversations);
  assert(
    afterAbsence[0]?.revision === (beforeAbsence[0]?.revision ?? -1) + 1,
    'duplicate provider deletion was not an idempotent evidence transition'
  );
  assert((await db.select().from(responsibilities)).length === 0,
    'historical Source ingestion auto-created a Responsibility');
  await evidence.upsertNormalizedMessage(source);
  const restored = await db.select({providerDeletedAt: messages.providerDeletedAt}).from(messages);
  assert(restored[0]?.providerDeletedAt === null, 'provider reappearance did not clear mailbox absence state');

  const advanced = await gmail.advanceCursor({
    userId: ownerId,
    connectedAccountId: accountId,
    expectedCursor: null,
    nextCursor: '100',
    full: false
  });
  const staleAdvance = await gmail.advanceCursor({
    userId: ownerId,
    connectedAccountId: accountId,
    expectedCursor: null,
    nextCursor: '99',
    full: false
  });
  assert(advanced && !staleAdvance, 'cursor compare-and-set accepted a stale worker');

  await gmail.deleteBootstrapState(accountId);
  const bootstrapRows = await db.select().from(gmailBootstrapStates);
  assert(bootstrapRows.length === 0, 'completed bootstrap state was not cleared');

  process.stdout.write('G20 Gmail PostgreSQL credential/ownership/dedup/cursor integration: PASS\n');
} finally {
  await pool.end();
}
