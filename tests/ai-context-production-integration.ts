import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';

import {drizzle} from 'drizzle-orm/node-postgres';
import {migrate} from 'drizzle-orm/node-postgres/migrator';
import {Pool} from 'pg';

import {AIInterpretationRunRepository} from '../src/server/db/repositories/ai';
import {ResponsibilityInterpretationRuntime} from '../src/server/ai/runtime';
import * as schema from '../src/server/db/schema';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function expectReject(operation: () => Promise<unknown>, label: string): Promise<void> {
  try {
    await operation();
  } catch {
    return;
  }
  throw new Error(`${label} was accepted`);
}

const databaseUrl = process.env.G70_DATABASE_URL;
assert(databaseUrl, 'G70_DATABASE_URL is required; no mock or fallback database is accepted.');

const pool = new Pool({
  connectionString: databaseUrl,
  max: 8,
  application_name: 'lunowa-g70-ai-context-production'
});
const db = drizzle(pool, {schema});
const migrationFolder = resolve(import.meta.dirname, '../drizzle/migrations');

const captureConfig = {
  model: 'gpt-5.6',
  modelConfigVersion: 'g70-production-fixture-v1',
  dataControlMode: 'STANDARD_API_RETENTION' as const
};

function zoneMap(messages: readonly {id: string; body: string}[]) {
  return new Map(messages.map((message) => [message.id, [{zone: 'AUTHORED_CURRENT' as const, start: 0, end: message.body.length}]]));
}

function assertManifest(manifest: Record<string, unknown> | undefined, revision: number, messageId: string): void {
  assert(manifest?.basisEvidenceRevision === revision, 'AIInterpretationRun manifest revision is incorrect');
  assert(manifest?.focalMessageId === messageId, 'AIInterpretationRun manifest focal message is incorrect');
  assert(JSON.stringify(manifest?.messageIds) === JSON.stringify([messageId]), 'AIInterpretationRun manifest message scope is incorrect');
  assert(manifest?.storageRequest === 'store:false', 'AIInterpretationRun manifest storage request is incorrect');
  assert(manifest?.snapshotConsistency === 'REPEATABLE_READ', 'AIInterpretationRun manifest snapshot mode is incorrect');
}

try {
  const version = await pool.query<{server_version_num: string; version: string}>(
    "SELECT current_setting('server_version_num') AS server_version_num, version()"
  );
  assert(version.rows[0]?.server_version_num === '180006', 'G70 integration requires PostgreSQL 18.6.');

  const preexisting = await pool.query<{table_name: string}>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  assert(
    preexisting.rowCount === 0,
    `G70 integration requires a clean database; found ${preexisting.rows.map(({table_name}) => table_name).join(', ')}.`
  );
  await migrate(db, {migrationsFolder: migrationFolder});

  const user1 = randomUUID();
  const user2 = randomUUID();
  const account1 = randomUUID();
  const account2 = randomUUID();
  const conversation1 = randomUUID();
  const conversation2 = randomUUID();
  const sender1 = randomUUID();
  const recipient1 = randomUUID();
  const sender2 = randomUUID();
  const recipient2 = randomUUID();
  const message1 = randomUUID();
  const message2 = randomUUID();
  const initialBody = 'DB-owned current body; caller cannot replace this text.';
  const changedBody = 'Concurrent DB-owned replacement body.';

  await pool.query(
    `INSERT INTO "user" (id, name, email)
     VALUES ($1, 'G70 first user', $2), ($3, 'G70 second user', $4)`,
    [user1, `g70-first-${user1}@example.invalid`, user2, `g70-second-${user2}@example.invalid`]
  );
  await pool.query(
    `INSERT INTO connected_accounts
      (id, user_id, provider, provider_account_id, email_address, credential_reference)
     VALUES ($1, $2, 'fixture-provider', 'g70-account-1', 'first@example.invalid', 'credential-ref:g70-1'),
            ($3, $4, 'fixture-provider', 'g70-account-2', 'second@example.invalid', 'credential-ref:g70-2')`,
    [account1, user1, account2, user2]
  );
  await pool.query(
    `INSERT INTO conversations (id, user_id, connected_account_id, semantic_evidence_revision)
     VALUES ($1, $2, $3, 7), ($4, $5, $6, 3)`,
    [conversation1, user1, account1, conversation2, user2, account2]
  );
  await pool.query(
    `INSERT INTO participant_identities (id, user_id, canonical_email, display_name)
     VALUES ($1, $2, 'sender-one@example.invalid', 'Sender One'),
            ($3, $4, 'recipient-one@example.invalid', 'Recipient One'),
            ($5, $6, 'sender-two@example.invalid', 'Sender Two'),
            ($7, $8, 'recipient-two@example.invalid', 'Recipient Two')`,
    [sender1, user1, recipient1, user1, sender2, user2, recipient2, user2]
  );
  await pool.query(
    `INSERT INTO messages
      (id, user_id, connected_account_id, conversation_id, provider_message_id, direction,
       sender_participant_id, subject, text_body, sent_at_or_received_at)
     VALUES ($1, $2, $3, $4, 'g70-message-1', 'INBOUND', $5, 'G70 first message', $6, now()),
            ($7, $8, $9, $10, 'g70-message-2', 'INBOUND', $11, 'G70 second message', 'foreign body', now())`,
    [message1, user1, account1, conversation1, sender1, initialBody, message2, user2, account2, conversation2, sender2]
  );
  await pool.query(
    `INSERT INTO message_participants
      (id, user_id, connected_account_id, message_id, participant_id, role)
     VALUES ($1, $2, $3, $4, $5, 'TO'), ($6, $7, $8, $9, $10, 'TO')`,
    [randomUUID(), user1, account1, message1, recipient1, randomUUID(), user2, account2, message2, recipient2]
  );

  const request = {
    userId: user1,
    connectedAccountId: account1,
    conversationId: conversation1,
    sourceEventKey: 'g70-message-1-revision-7',
    focalMessageId: message1,
    messageIds: [message1]
  };
  const resolver = ({messages}: {messages: readonly {id: string; body: string}[]}) => zoneMap(messages);
  const noResolverRuns = await pool.query<{count: string}>('SELECT count(*)::text AS count FROM ai_interpretation_runs');
  await expectReject(
    () => new AIInterpretationRunRepository(db).captureInterpretation(request, captureConfig),
    'interpretation without trusted source-zone resolver'
  );
  const noResolverRunsAfter = await pool.query<{count: string}>('SELECT count(*)::text AS count FROM ai_interpretation_runs');
  assert(noResolverRuns.rows[0]?.count === noResolverRunsAfter.rows[0]?.count, 'source-zone fail-closed path persisted an AI run');
  let blockedProviderCalls = 0;
  const blockedRuntime = new ResponsibilityInterpretationRuntime({
    transport: {kind: 'test', create: async () => { blockedProviderCalls += 1; return {}; }},
    runStore: new AIInterpretationRunRepository(db),
    contextSnapshot: new AIInterpretationRunRepository(db),
    config: captureConfig,
    currentEvidenceRevision: async () => 7
  });
  await expectReject(() => blockedRuntime.run(request), 'runtime without trusted source-zone resolver');
  assert(blockedProviderCalls === 0, 'provider was called before the trusted source-zone resolver failed closed');

  await expectReject(
    () => new AIInterpretationRunRepository(db, resolver).captureInterpretation({...request, userId: user2}, captureConfig),
    'foreign user/account scope'
  );
  await expectReject(
    () => new AIInterpretationRunRepository(db, resolver).captureInterpretation({...request, messageIds: [message2]}, captureConfig),
    'foreign message scope'
  );
  await expectReject(
    () => new AIInterpretationRunRepository(db, resolver).captureInterpretation({...request, focalMessageId: message2}, captureConfig),
    'focal message outside exact scope'
  );

  const repository = new AIInterpretationRunRepository(db, resolver);
  const firstCapture = await repository.captureInterpretation(request, captureConfig);
  assert(firstCapture.context.evidenceRevision === 7, 'authorized context did not read the conversation revision from PostgreSQL');
  assert(firstCapture.context.messages.length === 1 && firstCapture.context.messages[0]?.id === message1, 'authorized context did not preserve the exact message scope');
  assert(firstCapture.context.messages[0]?.body === initialBody, 'authorized context body was not read from PostgreSQL');
  const firstRun = await pool.query<{basis_evidence_revision: string; message_id: string; context_manifest: Record<string, unknown>}>(
    'SELECT basis_evidence_revision::text, message_id, context_manifest FROM ai_interpretation_runs WHERE id = $1',
    [firstCapture.runId]
  );
  assert(
    firstRun.rows[0]?.basis_evidence_revision === '7' && firstRun.rows[0].message_id === message1,
    'AIInterpretationRun did not persist the captured revision and focal message'
  );
  assertManifest(firstRun.rows[0]?.context_manifest, 7, message1);

  let resolverEntered!: () => void;
  let releaseResolver!: () => void;
  const resolverReady = new Promise<void>((resolveReady) => { resolverEntered = resolveReady; });
  const resolverRelease = new Promise<void>((resolveRelease) => { releaseResolver = resolveRelease; });
  const concurrentResolver = async ({messages}: {messages: readonly {id: string; body: string}[]}) => {
    resolverEntered();
    await resolverRelease;
    return zoneMap(messages);
  };
  const concurrentRepository = new AIInterpretationRunRepository(db, concurrentResolver);
  const concurrentCapturePromise = concurrentRepository.captureInterpretation({...request, sourceEventKey: 'g70-concurrent-revision-7'}, captureConfig);
  await resolverReady;
  const concurrentClient = await pool.connect();
  try {
    await concurrentClient.query('BEGIN');
    await concurrentClient.query('UPDATE messages SET text_body = $1 WHERE id = $2 AND connected_account_id = $3', [changedBody, message1, account1]);
    await concurrentClient.query('UPDATE conversations SET semantic_evidence_revision = 8 WHERE id = $1 AND connected_account_id = $2', [conversation1, account1]);
    await concurrentClient.query('COMMIT');
  } finally {
    concurrentClient.release();
  }
  releaseResolver();
  const concurrentCapture = await concurrentCapturePromise;
  const currentRows = await pool.query<{semantic_evidence_revision: string; text_body: string}>({
    text: `SELECT c.semantic_evidence_revision::text, m.text_body
             FROM conversations c
             INNER JOIN messages m ON m.conversation_id = c.id AND m.connected_account_id = c.connected_account_id
            WHERE c.id = $1 AND m.id = $2`,
    values: [conversation1, message1]
  });
  assert(currentRows.rows[0]?.semantic_evidence_revision === '8' && currentRows.rows[0].text_body === changedBody, 'concurrent PostgreSQL evidence update did not commit');
  assert(concurrentCapture.context.evidenceRevision === 7 && concurrentCapture.context.messages[0]?.body === initialBody, 'repeatable-read capture mixed the concurrent revision/body');
  const concurrentRun = await pool.query<{basis_evidence_revision: string; context_manifest: Record<string, unknown>}>(
    'SELECT basis_evidence_revision::text, context_manifest FROM ai_interpretation_runs WHERE id = $1',
    [concurrentCapture.runId]
  );
  assert(concurrentRun.rows[0]?.basis_evidence_revision === '7', 'concurrent AIInterpretationRun revision was not internally consistent');
  assertManifest(concurrentRun.rows[0]?.context_manifest, 7, message1);

  const currentRevision = await pool.query<{semantic_evidence_revision: string}>(
    'SELECT semantic_evidence_revision::text FROM conversations WHERE id = $1',
    [conversation1]
  );
  assert(currentRevision.rows[0]?.semantic_evidence_revision === '8', 'post-capture currentness did not observe the new revision');

  let providerCalls = 0;
  let providerObservedCapturedRun = false;
  const runtime = new ResponsibilityInterpretationRuntime({
    transport: {
      kind: 'test',
      create: async () => {
        providerCalls += 1;
        const visibleRuns = await pool.query<{status: string; basis_evidence_revision: string; message_id: string}>(
          `SELECT status, basis_evidence_revision::text, message_id
             FROM ai_interpretation_runs
            WHERE user_id = $1
              AND conversation_id = $2
              AND basis_evidence_revision = 8
              AND message_id = $3
              AND status = 'CAPTURED'`,
          [user1, conversation1, message1]
        );
        providerObservedCapturedRun = visibleRuns.rows.length === 1;
        return {status: 'completed', output_text: JSON.stringify({
          schemaVersion: 1,
          basisEvidenceRevision: 8,
          status: 'CANDIDATE',
          sourceMessageId: message1,
          abstentionReason: null,
          semanticUnits: [],
          sourceRefs: [{
            messageId: message1,
            zone: 'AUTHORED_CURRENT',
            excerpt: changedBody,
            start: 0,
            end: changedBody.length
          }]
        })};
      }
    },
    runStore: repository,
    contextSnapshot: repository,
    config: captureConfig,
    currentEvidenceRevision: async () => {
      const row = await pool.query<{semantic_evidence_revision: string}>(
        'SELECT semantic_evidence_revision::text FROM conversations WHERE id = $1',
        [conversation1]
      );
      return Number(row.rows[0]?.semantic_evidence_revision);
    }
  });
  const runtimeResult = await runtime.run({...request, sourceEventKey: 'g70-runtime-revision-8'});
  assert(providerCalls === 1, `runtime called the fake provider ${providerCalls} times instead of exactly once`);
  assert(providerObservedCapturedRun, 'provider observed no unique pre-call captured AIInterpretationRun for revision 8');
  assert(runtimeResult.status === 'NO_RESPONSIBILITY', `runtime production-context result was ${JSON.stringify(runtimeResult)}`);

  console.log(JSON.stringify({
    kind: 'g70-ai-context-production-result-v1',
    postgres: version.rows[0]?.version,
    checks: [
      'clean current production migrations',
      'two-tenant account/conversation/message ownership rejection',
      'mandatory exact message scope and focal-message authorization',
      'trusted source-zone resolver fail-closed capture',
      'DB-owned body and participant context capture',
      'AIInterpretationRun revision/message/focal manifest persistence',
      'PostgreSQL repeatable-read concurrent revision/body consistency',
      'post-capture currentness observes the new revision'
    ],
    status: 'PASS'
  }, null, 2));
} finally {
  await pool.end();
}
