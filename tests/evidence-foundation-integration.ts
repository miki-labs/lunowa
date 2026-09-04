import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';
import {drizzle} from 'drizzle-orm/node-postgres';
import {migrate} from 'drizzle-orm/node-postgres/migrator';
import {Pool} from 'pg';

import {normalizedEvidenceFixture} from '../src/server/evidence/fixtures';
import {EvidenceRepository} from '../src/server/db/repositories/evidence';
import * as databaseSchema from '../src/server/db/schema';
import {user} from '../src/server/db/schema/auth';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function expectedDatabaseError(error: unknown, constraint: string): void {
  const databaseError = error as {code?: string; constraint?: string};
  assert(databaseError.code === '23514' || databaseError.code === '23503', `expected PostgreSQL integrity error, got ${databaseError.code ?? 'unknown'}`);
  assert(databaseError.constraint === constraint, `expected ${constraint}, got ${databaseError.constraint ?? 'unknown'}`);
}

const databaseUrl = process.env.G19_DATABASE_URL;
assert(databaseUrl, 'G19_DATABASE_URL is required; no mock or fallback database is accepted.');

const pool = new Pool({connectionString: databaseUrl, max: 8, application_name: 'lunowa-g19-evidence-foundation'});
const db = drizzle(pool, {schema: databaseSchema});
const migrationFolder = resolve(import.meta.dirname, '../drizzle/migrations');

try {
  const version = await pool.query<{server_version_num: string; version: string}>(
    "SELECT current_setting('server_version_num') AS server_version_num, version()"
  );
  assert(version.rows[0]?.server_version_num === '180006', 'G19 integration requires PostgreSQL 18.6.');

  const preexisting = await pool.query<{table_name: string}>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  assert(
    preexisting.rowCount === 0,
    `G19 integration requires a clean database; found ${preexisting.rows.map(({table_name}) => table_name).join(', ')}.`
  );
  await migrate(db, {migrationsFolder: migrationFolder});

  const firstUser = randomUUID();
  const secondUser = randomUUID();
  const accountId = randomUUID();
  const secondAccountId = randomUUID();
  await db.insert(user).values([
    {id: firstUser, name: 'G19 first user', email: `g19-first-${firstUser}@example.invalid`},
    {id: secondUser, name: 'G19 second user', email: `g19-second-${secondUser}@example.invalid`}
  ]);

  const repository = new EvidenceRepository(db);
  const persistedAccountId = await repository.upsertConnectedAccount({
    userId: firstUser,
    provider: 'fixture-provider',
    providerAccountId: accountId,
    emailAddress: 'owner@example.com',
    grantedCapabilities: ['incremental_sync', 'attachment_fetch'],
    credentialReference: 'credential-ref:g19-fixture'
  });
  assert(persistedAccountId, 'connected account was not persisted');
  await repository.upsertProviderSyncState({
    userId: firstUser,
    connectedAccountId: persistedAccountId,
    status: 'HEALTHY',
    syncGeneration: 1,
    cursorOrDeltaToken: 'opaque-cursor'
  });
  const secondPersistedAccountId = await repository.upsertConnectedAccount({
    userId: secondUser,
    provider: 'fixture-provider',
    providerAccountId: secondAccountId,
    emailAddress: 'second-owner@example.com',
    credentialReference: 'credential-ref:g19-second-fixture'
  });

  const firstIngestion = await repository.upsertNormalizedMessage(
    normalizedEvidenceFixture(firstUser, persistedAccountId)
  );
  assert(firstIngestion.changed && firstIngestion.evidenceRevision === 1, 'first normalized ingestion did not advance evidence revision');
  const secondIngestion = await repository.upsertNormalizedMessage(
    normalizedEvidenceFixture(firstUser, persistedAccountId)
  );
  assert(!secondIngestion.changed && secondIngestion.evidenceRevision === 1, 'duplicate normalized ingestion was not idempotent');

  const counts = await pool.query<{messages: string; attachments: string; participants: string; edges: string}>(`
    SELECT
      (SELECT count(*)::text FROM messages) AS messages,
      (SELECT count(*)::text FROM attachments) AS attachments,
      (SELECT count(*)::text FROM participant_identities) AS participants,
      (SELECT count(*)::text FROM message_participants) AS edges
  `);
  assert(
    counts.rows[0]?.messages === '1' &&
      counts.rows[0]?.attachments === '1' &&
      counts.rows[0]?.participants === '2' &&
      counts.rows[0]?.edges === '1',
    `normalized evidence counts are incorrect: ${JSON.stringify(counts.rows[0])}`
  );

  const conversationId = normalizedEvidenceFixture(firstUser, persistedAccountId).conversation.id;
  try {
    await pool.query(
      'INSERT INTO conversations (id, user_id, connected_account_id) VALUES ($1, $2, $3)',
      [randomUUID(), secondUser, persistedAccountId]
    );
    throw new Error('cross-user conversation ownership was accepted');
  } catch (error) {
    if (error instanceof Error && error.message === 'cross-user conversation ownership was accepted') throw error;
    expectedDatabaseError(error, 'conversations_account_owner_fk');
  }

  try {
    await pool.query(
      `INSERT INTO messages
        (id, user_id, connected_account_id, conversation_id, provider_message_id, direction, subject, sent_at_or_received_at)
       VALUES ($1, $2, $3, $4, $5, 'INBOUND', 'cross-user', now())`,
      [randomUUID(), secondUser, persistedAccountId, conversationId, 'cross-user-message']
    );
    throw new Error('cross-user message ownership was accepted');
  } catch (error) {
    if (error instanceof Error && error.message === 'cross-user message ownership was accepted') throw error;
    expectedDatabaseError(error, 'messages_account_owner_fk');
  }

  try {
    await pool.query('UPDATE conversations SET semantic_evidence_revision = 0 WHERE id = $1', [conversationId]);
    throw new Error('conversation evidence revision decreased');
  } catch (error) {
    if (error instanceof Error && error.message === 'conversation evidence revision decreased') throw error;
    expectedDatabaseError(error, 'conversations_revision_monotonic');
  }

  const revisions = await Promise.all([
    repository.advanceConversationEvidenceRevision({userId: firstUser, connectedAccountId: persistedAccountId, conversationId}),
    repository.advanceConversationEvidenceRevision({userId: firstUser, connectedAccountId: persistedAccountId, conversationId})
  ]);
  assert(new Set(revisions).size === 2 && revisions.every((revision) => revision >= 2), 'concurrent evidence revision advances were not serialized');

  const finalRevision = await pool.query<{semantic_evidence_revision: string}>(
    'SELECT semantic_evidence_revision::text FROM conversations WHERE id = $1',
    [conversationId]
  );
  assert(finalRevision.rows[0]?.semantic_evidence_revision === '3', 'final evidence revision is not monotonic or expected');
  assert(secondPersistedAccountId !== persistedAccountId, 'fixture accounts unexpectedly shared an ID');

  console.log(JSON.stringify({
    kind: 'g19-evidence-foundation-result-v1',
    postgres: version.rows[0]?.version,
    versions: {'drizzle-orm': '0.45.2', 'drizzle-kit': '0.31.10', pg: '8.23.0'},
    checks: [
      'clean migration',
      'production G10 UUID user foreign keys',
      'cross-user account/conversation/message rejection',
      'provider-message idempotent re-ingestion',
      'participant ownership and normalized edges',
      'attachment metadata persistence',
      'database monotonic revision trigger',
      'concurrent revision advances'
    ],
    status: 'PASS'
  }, null, 2));
} finally {
  await pool.end();
}
