import {readFile, readdir} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';
import {Pool} from 'pg';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function expectedDatabaseError(
  error: unknown,
  constraint: string,
  allowedCodes: readonly string[] = ['23503', '23505', '23514']
): void {
  const databaseError = error as {code?: string; constraint?: string};
  assert(
    databaseError.code !== undefined && allowedCodes.includes(databaseError.code),
    `expected PostgreSQL integrity error ${allowedCodes.join('/')}, got ${databaseError.code ?? 'unknown'}`
  );
  assert(
    databaseError.constraint === constraint,
    `expected ${constraint}, got ${databaseError.constraint ?? 'unknown'}`
  );
}

async function expectFailure(
  operation: () => Promise<unknown>,
  constraint: string,
  allowedCodes?: readonly string[]
): Promise<void> {
  try {
    await operation();
    throw new Error(`expected ${constraint} to reject the operation`);
  } catch (error) {
    if (error instanceof Error && error.message === `expected ${constraint} to reject the operation`) {
      throw error;
    }
    expectedDatabaseError(error, constraint, allowedCodes);
  }
}

const databaseUrl = process.env.G30_DATABASE_URL;
assert(databaseUrl, 'G30_DATABASE_URL is required; no mock or fallback database is accepted.');

const pool = new Pool({
  connectionString: databaseUrl,
  max: 8,
  application_name: 'lunowa-g30-responsibility-production'
});
const migrationFolder = resolve(import.meta.dirname, '../drizzle/migrations');

async function applyMigration(path: string, sql: string): Promise<void> {
  await pool.query('BEGIN');
  try {
    await pool.query(sql);
    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}

try {
  const version = await pool.query<{server_version_num: string; version: string}>(
    "SELECT current_setting('server_version_num') AS server_version_num, version()"
  );
  assert(
    version.rows[0]?.server_version_num === '180006',
    'G30 integration requires PostgreSQL 18.6.'
  );

  const preexisting = await pool.query<{table_name: string}>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  assert(
    preexisting.rowCount === 0,
    `G30 integration requires a clean database; found ${preexisting.rows
      .map(({table_name}) => table_name)
      .join(', ')}.`
  );

  const migrationFiles = (await readdir(migrationFolder))
    .filter((name) => /^000[012]_.*\.sql$/.test(name))
    .sort();
  assert(
    migrationFiles.length === 3 && migrationFiles[0]?.startsWith('0000_') &&
      migrationFiles[1]?.startsWith('0001_') && migrationFiles[2]?.startsWith('0002_'),
    `expected G10, G19, and G30 migrations in order, got ${migrationFiles.join(', ')}`
  );

  const migrationSql = await Promise.all(
    migrationFiles.map((file) => readFile(resolve(migrationFolder, file), 'utf8'))
  );
  const g30Sql = migrationSql[2] ?? '';
  const aiCreate = g30Sql.indexOf('CREATE TABLE "ai_interpretation_runs"');
  const responsibilityCreate = g30Sql.indexOf('CREATE TABLE "responsibilities"');
  assert(aiCreate >= 0 && responsibilityCreate >= 0 && aiCreate < responsibilityCreate,
    'G30 must create AIInterpretationRun before Responsibility tables.');
  assert(!g30Sql.includes('p13_fixture_'), 'G30 migration must not use proof fixtures as production targets.');

  await applyMigration(migrationFiles[0]!, migrationSql[0]!);
  await applyMigration(migrationFiles[1]!, migrationSql[1]!);
  const acceptedG19State = await pool.query<{user_exists: boolean; evidence_exists: boolean; responsibility_exists: boolean}>(`
    SELECT
      to_regclass('public."user"') IS NOT NULL AS user_exists,
      to_regclass('public.connected_accounts') IS NOT NULL AS evidence_exists,
      to_regclass('public.responsibilities') IS NOT NULL AS responsibility_exists
  `);
  assert(
    acceptedG19State.rows[0]?.user_exists && acceptedG19State.rows[0]?.evidence_exists &&
      !acceptedG19State.rows[0]?.responsibility_exists,
    'G30 did not start from the accepted G19 prior state.'
  );
  await applyMigration(migrationFiles[2]!, migrationSql[2]!);

  const requiredTables = [
    'ai_interpretation_runs',
    'responsibilities',
    'responsibility_expected_events',
    'responsibility_obligation_legs',
    'responsibility_temporal_facts',
    'responsibility_field_decisions',
    'responsibility_admission_reviews',
    'responsibility_domain_events',
    'responsibility_provenance_refs'
  ];
  const tables = await pool.query<{table_name: string}>(
    `SELECT table_name
       FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])
      ORDER BY table_name`,
    [requiredTables]
  );
  assert(
    new Set(tables.rows.map(({table_name}) => table_name)).size === requiredTables.length,
    `production Responsibility tables are incomplete: ${JSON.stringify(tables.rows)}`
  );
  const fixtureTables = await pool.query<{table_name: string}>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'p13_fixture_%'"
  );
  assert(fixtureTables.rowCount === 0, 'proof-only fixture tables were promoted into production.');

  const requiredForeignKeys = [
    'ai_interpretation_runs_user_fk',
    'ai_interpretation_runs_conversation_fk',
    'ai_interpretation_runs_message_fk',
    'responsibilities_account_owner_fk',
    'responsibilities_conversation_account_fk',
    'responsibility_expected_events_participant_user_fk',
    'responsibility_obligation_legs_participant_user_fk',
    'responsibility_admission_reviews_interpretation_run_user_fk',
    'responsibility_domain_events_interpretation_run_user_fk',
    'responsibility_provenance_refs_message_account_fk',
    'responsibility_provenance_refs_interpretation_run_user_fk'
  ];
  const foreignKeys = await pool.query<{conname: string; target: string}>(
    `SELECT conname, confrelid::regclass::text AS target
       FROM pg_constraint
      WHERE conname = ANY($1::text[])
      ORDER BY conname`,
    [requiredForeignKeys]
  );
  assert(
    new Set(foreignKeys.rows.map(({conname}) => conname)).size === requiredForeignKeys.length,
    `production FK closure is incomplete: ${JSON.stringify(foreignKeys.rows)}`
  );
  assert(
    foreignKeys.rows.every(({target}) => !target.includes('p13_fixture_')),
    'a production Responsibility FK resolves to a proof fixture.'
  );

  const requiredIndexes = [
    ['ai_interpretation_runs', 'ai_interpretation_runs_id_user_uq'],
    ['connected_accounts', 'connected_accounts_id_user_uq'],
    ['conversations', 'conversations_id_account_uq'],
    ['participant_identities', 'participant_identities_id_user_uq'],
    ['messages', 'messages_id_account_uq'],
    ['responsibilities', 'responsibilities_id_user_uq'],
    ['responsibilities', 'responsibilities_id_account_uq'],
    ['responsibility_domain_events', 'responsibility_domain_events_application_effect_uq'],
    ['responsibility_temporal_facts', 'responsibility_temporal_current_parent_uq']
  ];
  for (const [tableName, indexName] of requiredIndexes) {
    const index = await pool.query<{indexdef: string}>(
      'SELECT indexdef FROM pg_indexes WHERE schemaname = \'public\' AND tablename = $1 AND indexname = $2',
      [tableName, indexName]
    );
    assert(index.rowCount === 1, `required production index ${indexName} is missing.`);
  }

  const user1 = randomUUID();
  const user2 = randomUUID();
  const account1 = randomUUID();
  const account2 = randomUUID();
  const conversation1 = randomUUID();
  const conversation2 = randomUUID();
  const participant1 = randomUUID();
  const participant2 = randomUUID();
  const message1 = randomUUID();
  const message2 = randomUUID();
  const aiRun1 = randomUUID();
  const responsibility1 = randomUUID();
  const responsibility2 = randomUUID();
  const expectedEvent1 = randomUUID();
  const obligationLeg1 = randomUUID();
  const temporalFact1 = randomUUID();
  const fieldDecision1 = randomUUID();
  const domainEvent1 = randomUUID();
  const admissionReview1 = randomUUID();

  await pool.query(
    `INSERT INTO "user" (id, name, email) VALUES ($1, 'G30 first user', $2), ($3, 'G30 second user', $4)`,
    [user1, `g30-first-${user1}@example.invalid`, user2, `g30-second-${user2}@example.invalid`]
  );
  await pool.query(
    `INSERT INTO connected_accounts
      (id, user_id, provider, provider_account_id, email_address, credential_reference)
     VALUES ($1, $2, 'fixture-provider', 'g30-account-1', 'first@example.invalid', 'credential-ref:g30-1'),
            ($3, $4, 'fixture-provider', 'g30-account-2', 'second@example.invalid', 'credential-ref:g30-2')`,
    [account1, user1, account2, user2]
  );
  await pool.query(
    `INSERT INTO conversations (id, user_id, connected_account_id, semantic_evidence_revision)
     VALUES ($1, $2, $3, 1), ($4, $5, $6, 1)`,
    [conversation1, user1, account1, conversation2, user2, account2]
  );
  await pool.query(
    `INSERT INTO participant_identities (id, user_id, canonical_email)
     VALUES ($1, $2, 'participant-one@example.invalid'), ($3, $4, 'participant-two@example.invalid')`,
    [participant1, user1, participant2, user2]
  );
  await pool.query(
    `INSERT INTO messages
      (id, user_id, connected_account_id, conversation_id, provider_message_id, direction, subject, sent_at_or_received_at)
     VALUES ($1, $2, $3, $4, 'g30-message-1', 'INBOUND', 'G30 production fixture', now()),
            ($5, $6, $7, $8, 'g30-message-2', 'INBOUND', 'G30 second fixture', now())`,
    [message1, user1, account1, conversation1, message2, user2, account2, conversation2]
  );
  await pool.query(
    `INSERT INTO ai_interpretation_runs
      (id, user_id, conversation_id, message_id, model_config_version, basis_evidence_revision, context_manifest)
     VALUES ($1, $2, $3, $4, 'prelude-v1', 1, $5::jsonb)`,
    [aiRun1, user1, conversation1, message1, JSON.stringify({messageIds: [message1]})]
  );
  await pool.query(
    `INSERT INTO responsibilities
      (id, user_id, connected_account_id, conversation_id, operational_outcome, accepted_evidence_revision)
     VALUES ($1, $2, $3, $4, 'Confirm the production persistence path', 1),
            ($5, $2, $3, $4, 'Keep a second outcome in the same Conversation', 1)`,
    [responsibility1, user1, account1, conversation1, responsibility2]
  );
  await pool.query(
    `INSERT INTO responsibility_expected_events
      (id, responsibility_id, user_id, actor_kind, actor_participant_id, event_code)
     VALUES ($1, $2, $3, 'PARTICIPANT', $4, 'REPLY')`,
    [expectedEvent1, responsibility1, user1, participant1]
  );
  await pool.query(
    `INSERT INTO responsibility_obligation_legs
      (id, responsibility_id, user_id, bearer_kind, bearer_participant_id, action_code, basis_kind, activation_event_id)
     VALUES ($1, $2, $3, 'PARTICIPANT', $4, 'CONFIRM', 'DIRECT_REQUEST', $5)`,
    [obligationLeg1, responsibility1, user1, participant1, expectedEvent1]
  );
  await pool.query(
    `INSERT INTO responsibility_temporal_facts
      (id, responsibility_id, temporal_kind, value_kind, resolved_date, precision_code)
     VALUES ($1, $2, 'USER_TARGET', 'DATE', '2030-01-02', 'DAY')`,
    [temporalFact1, responsibility1]
  );
  await pool.query(
    `INSERT INTO responsibility_field_decisions
      (id, responsibility_id, field_key, value_jsonb, authority_kind, basis_evidence_revision)
     VALUES ($1, $2, 'operational_outcome', '{"value":"confirmed"}', 'USER', 1)`,
    [fieldDecision1, responsibility1]
  );
  await pool.query(
    `INSERT INTO responsibility_domain_events
      (id, responsibility_id, user_id, operation, actor_kind, reason_codes, basis_evidence_revision,
       aggregate_version_before, aggregate_version_after, mutates_state, source_event_key,
       application_key, effect_key, correlation_id, reducer_version, interpretation_run_id)
     VALUES ($1, $2, $3, 'CREATE', 'SYSTEM', ARRAY['ADMITTED'], 1, 0, 1, true,
             'g30-source-1', 'g30-application-1', 'g30-effect-1', $4, 'v0.1', $5)`,
    [domainEvent1, responsibility1, user1, randomUUID(), aiRun1]
  );
  await pool.query(
    `INSERT INTO responsibility_provenance_refs
      (id, user_id, connected_account_id, responsibility_id, target_kind, evidence_kind, message_id, domain_event_id)
     VALUES ($1, $2, $3, $4, 'RESPONSIBILITY', 'MESSAGE', $5, $6)`,
    [randomUUID(), user1, account1, responsibility1, message1, domainEvent1]
  );
  await pool.query(
    `INSERT INTO responsibility_admission_reviews
      (id, user_id, connected_account_id, conversation_id, reason_codes, basis_evidence_revision,
       source_event_key, candidate_key, interpretation_run_id)
     VALUES ($1, $2, $3, $4, ARRAY['AMBIGUOUS_ADMISSION'], 1, 'g30-review-source', 'g30-candidate', $5)`,
    [admissionReview1, user1, account1, conversation1, aiRun1]
  );

  await expectFailure(
    () => pool.query(
      `INSERT INTO ai_interpretation_runs
        (id, user_id, conversation_id, model_config_version, basis_evidence_revision)
       VALUES ($1, $2, $3, 'prelude-v1', 1)`,
      [randomUUID(), randomUUID(), conversation1]
    ),
    'ai_interpretation_runs_user_fk'
  );
  await expectFailure(
    () => pool.query(
      `INSERT INTO responsibilities
        (id, user_id, connected_account_id, conversation_id, operational_outcome, accepted_evidence_revision)
       VALUES ($1, $2, $3, $4, 'cross-account', 1)`,
      [randomUUID(), user2, account1, conversation1]
    ),
    'responsibilities_account_owner_fk'
  );
  await expectFailure(
    () => pool.query(
      `INSERT INTO responsibilities
        (id, user_id, connected_account_id, conversation_id, operational_outcome, resolution_status, accepted_evidence_revision)
       VALUES ($1, $2, $3, $4, 'missing resolution reason', 'RESOLVED', 1)`,
      [randomUUID(), user1, account1, conversation1]
    ),
    'responsibilities_resolution_consistency_check'
  );
  await expectFailure(
    () => pool.query(
      `INSERT INTO responsibilities
        (id, user_id, connected_account_id, conversation_id, operational_outcome, attention_mode, live_tracking_state, accepted_evidence_revision)
       VALUES ($1, $2, $3, $4, 'invalid deferred history', 'DEFERRED', 'HISTORICAL_INACTIVE', 1)`,
      [randomUUID(), user1, account1, conversation1]
    ),
    'responsibilities_deferred_state_check'
  );
  await expectFailure(
    () => pool.query(
      `INSERT INTO responsibility_expected_events
        (id, responsibility_id, user_id, actor_kind, actor_participant_id, event_code)
       VALUES ($1, $2, $3, 'PARTICIPANT', $4, 'CROSS_USER')`,
      [randomUUID(), responsibility1, user1, participant2]
    ),
    'responsibility_expected_events_participant_user_fk'
  );
  await expectFailure(
    () => pool.query(
      `INSERT INTO responsibility_temporal_facts
        (id, responsibility_id, temporal_kind, value_kind, resolved_date, precision_code)
       VALUES ($1, $2, 'USER_TARGET', 'DATE', '2030-01-03', 'DAY')`,
      [randomUUID(), responsibility1]
    ),
    'responsibility_temporal_current_parent_uq',
    ['23505']
  );
  await pool.query(
    `INSERT INTO responsibility_temporal_facts
      (id, responsibility_id, temporal_kind, value_kind, precision_code, currentness_status, original_expression)
     VALUES ($1, $2, 'USER_TARGET', 'UNRESOLVED', 'DAY', 'CONFLICT_CANDIDATE', 'next week'),
            ($3, $2, 'USER_TARGET', 'UNRESOLVED', 'DAY', 'CONFLICT_CANDIDATE', 'the following week')`,
    [randomUUID(), responsibility1, randomUUID()]
  );
  await expectFailure(
    () => pool.query(
      `INSERT INTO responsibility_field_decisions
        (id, responsibility_id, field_key, value_jsonb, authority_kind, basis_evidence_revision)
       VALUES ($1, $2, 'operational_outcome', '{"value":"second"}', 'USER', 1)`,
      [randomUUID(), responsibility1]
    ),
    'responsibility_field_decisions_active_uq',
    ['23505']
  );
  await expectFailure(
    () => pool.query(
      `INSERT INTO responsibility_domain_events
        (id, responsibility_id, user_id, operation, actor_kind, reason_codes, basis_evidence_revision,
         aggregate_version_before, aggregate_version_after, mutates_state, source_event_key,
         application_key, effect_key, correlation_id, reducer_version)
       VALUES ($1, $2, $3, 'CREATE', 'SYSTEM', ARRAY['DUPLICATE'], 1, 0, 1, true,
               'g30-source-duplicate', 'g30-application-1', 'g30-effect-1', $4, 'v0.1')`,
      [randomUUID(), responsibility2, user1, randomUUID()]
    ),
    'responsibility_domain_events_application_effect_uq',
    ['23505']
  );
  await expectFailure(
    () => pool.query(
      `INSERT INTO responsibility_admission_reviews
        (id, user_id, connected_account_id, conversation_id, reason_codes, basis_evidence_revision,
         source_event_key, candidate_key)
       VALUES ($1, $2, $3, $4, ARRAY['DUPLICATE'], 1, 'g30-review-source', 'g30-candidate')`,
      [randomUUID(), user1, account1, conversation1]
    ),
    'responsibility_admission_reviews_same_revision_uq',
    ['23505']
  );
  await expectFailure(
    () => pool.query(
      `INSERT INTO responsibility_provenance_refs
        (id, user_id, connected_account_id, responsibility_id, target_kind, evidence_kind, message_id)
       VALUES ($1, $2, $3, $4, 'RESPONSIBILITY', 'MESSAGE', $5)`,
      [randomUUID(), user1, account1, responsibility2, message2]
    ),
    'responsibility_provenance_refs_message_account_fk'
  );

  const aggregateRows = await pool.query<{responsibilities: string; expected_events: string; legs: string; temporal: string; fields: string; events: string; provenance: string}>(`
    SELECT
      (SELECT count(*)::text FROM responsibilities WHERE id = $1) AS responsibilities,
      (SELECT count(*)::text FROM responsibility_expected_events WHERE responsibility_id = $1) AS expected_events,
      (SELECT count(*)::text FROM responsibility_obligation_legs WHERE responsibility_id = $1) AS legs,
      (SELECT count(*)::text FROM responsibility_temporal_facts WHERE responsibility_id = $1) AS temporal,
      (SELECT count(*)::text FROM responsibility_field_decisions WHERE responsibility_id = $1) AS fields,
      (SELECT count(*)::text FROM responsibility_domain_events WHERE responsibility_id = $1) AS events,
      (SELECT count(*)::text FROM responsibility_provenance_refs WHERE responsibility_id = $1) AS provenance
  `, [responsibility1]);
  assert(
    JSON.stringify(aggregateRows.rows[0]) === JSON.stringify({
      responsibilities: '1', expected_events: '1', legs: '1', temporal: '3', fields: '1', events: '1', provenance: '1'
    }),
    `frozen Responsibility aggregate rows were not persisted: ${JSON.stringify(aggregateRows.rows[0])}`
  );

  // Cross-child NO ACTION references are intentionally retained. Privacy
  // teardown removes dependent evidence in deterministic owner order first.
  await pool.query('DELETE FROM responsibility_provenance_refs WHERE responsibility_id = $1', [responsibility1]);
  await pool.query('DELETE FROM responsibility_temporal_facts WHERE responsibility_id = $1', [responsibility1]);
  await pool.query('DELETE FROM responsibility_obligation_legs WHERE responsibility_id = $1', [responsibility1]);
  await pool.query('DELETE FROM responsibility_expected_events WHERE responsibility_id = $1', [responsibility1]);
  await pool.query('DELETE FROM responsibility_field_decisions WHERE responsibility_id = $1', [responsibility1]);
  await pool.query('DELETE FROM responsibility_domain_events WHERE responsibility_id = $1', [responsibility1]);
  await pool.query('DELETE FROM responsibilities WHERE id = $1', [responsibility1]);
  const deletedRows = await pool.query<{count: string}>(
    `SELECT count(*)::text AS count FROM responsibility_expected_events WHERE responsibility_id = $1
     UNION ALL SELECT count(*)::text FROM responsibility_obligation_legs WHERE responsibility_id = $1
     UNION ALL SELECT count(*)::text FROM responsibility_temporal_facts WHERE responsibility_id = $1
     UNION ALL SELECT count(*)::text FROM responsibility_field_decisions WHERE responsibility_id = $1
     UNION ALL SELECT count(*)::text FROM responsibility_domain_events WHERE responsibility_id = $1
     UNION ALL SELECT count(*)::text FROM responsibility_provenance_refs WHERE responsibility_id = $1`,
    [responsibility1]
  );
  assert(deletedRows.rows.every(({count}) => count === '0'), 'aggregate-local state did not cascade on privacy deletion.');

  console.log(JSON.stringify({
    kind: 'g30-responsibility-production-result-v1',
    postgres: version.rows[0]?.version,
    migrations: migrationFiles,
    versions: {'drizzle-orm': '0.45.2', 'drizzle-kit': '0.31.10', pg: '8.23.0'},
    checks: [
      'clean G10 -> G19 -> G30 forward migration',
      'AIInterpretationRun prelude precedes dependent Responsibility tables',
      'production-only external FK closure and upstream ownership indexes',
      'two Responsibilities in one Conversation',
      'same-user/account/participant/message provenance isolation',
      'orthogonal resolution and tracking/attention checks',
      'temporal currentness and conflict-candidate behavior',
      'field decision and global domain-effect idempotency',
      'aggregate-local cascade privacy deletion'
    ],
    status: 'PASS'
  }, null, 2));
} finally {
  await pool.end();
}
