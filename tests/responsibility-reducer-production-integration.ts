import {readFile, readdir} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';

import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';

import * as schema from '../src/server/db/schema';
import {ResponsibilityRepository} from '../src/server/db/repositories/responsibility';
import type {
  ObligationLeg,
  ResponsibilityInterpretationCandidate,
  TemporalFact
} from '../src/server/responsibility';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const databaseUrl = process.env.G31_DATABASE_URL;
assert(databaseUrl, 'G31_DATABASE_URL is required; no mock or fallback database is accepted.');

const pool = new Pool({connectionString: databaseUrl, max: 4, application_name: 'lunowa-g31-reducer'});
const database = drizzle(pool, {schema});
const repository = new ResponsibilityRepository(database);

const userId = randomUUID();
const accountId = randomUUID();
const conversationId = randomUUID();
const messageId = randomUUID();
const legId = randomUUID();

const userLeg = (id: string, actionCode: string): ObligationLeg => ({
  id,
  bearer: 'USER',
  actionCode,
  status: 'OPEN',
  actionability: 'ACTIONABLE',
  basisKind: 'COMMUNICATED_REQUEST',
  provenance: []
});

function candidate(overrides: Partial<ResponsibilityInterpretationCandidate> = {}): ResponsibilityInterpretationCandidate {
  return {
    userId,
    connectedAccountId: accountId,
    conversationId,
    sourceEventKey: 'g31-message-1',
    candidateKey: 'g31-candidate-1',
    applicationKey: 'g31-application-1',
    evidenceRevision: 1,
    admission: {decision: 'TRACK', reasonCodes: ['MATERIAL_DIRECT_REQUEST']},
    operationalOutcome: 'send the revised document',
    obligationLegs: [userLeg(legId, 'SEND_REVISED_DOCUMENT')],
    sourceMessageId: messageId,
    provenance: [{evidenceKind: 'COMMUNICATED_CLAIM', messageId, sourceExcerptShort: 'send the revised document'}],
    ...overrides
  };
}

function stateFrom(result: Awaited<ReturnType<ResponsibilityRepository['reduceCandidate']>>, effectIndex = 0) {
  assert(result.status === 'APPLIED', result.status === 'APPLIED' ? 'unexpected applied result' : result.reason);
  const state = result.effects[effectIndex]?.state;
  assert(state, `expected effect ${effectIndex} to return a Responsibility state`);
  return state;
}

async function migrate(): Promise<void> {
  const files = (await readdir(resolve(import.meta.dirname, '../drizzle/migrations')))
    .filter((name) => /^000[012]_.*\.sql$/.test(name))
    .sort();
  assert(files.length === 3, `expected G10/G19/G30 migrations, got ${files.join(', ')}`);
  for (const file of files) await pool.query(await readFile(resolve(import.meta.dirname, `../drizzle/migrations/${file}`), 'utf8'));
}

try {
  const version = await pool.query<{server_version_num: string; version: string}>(
    "SELECT current_setting('server_version_num') AS server_version_num, version()"
  );
  assert(version.rows[0]?.server_version_num === '180006', 'G31 integration requires PostgreSQL 18.6.');
  const tables = await pool.query<{table_name: string}>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
  );
  assert(tables.rowCount === 0, 'G31 integration requires a clean database.');
  await migrate();

  await pool.query(
    `INSERT INTO "user" (id, name, email) VALUES ($1, 'G31 reducer user', $2)`,
    [userId, `g31-${userId}@example.invalid`]
  );
  await pool.query(
    `INSERT INTO connected_accounts (id, user_id, provider, provider_account_id, email_address, credential_reference)
     VALUES ($1, $2, 'fixture-provider', 'g31-account', 'g31@example.invalid', 'credential-ref:g31')`,
    [accountId, userId]
  );
  await pool.query(
    `INSERT INTO conversations (id, user_id, connected_account_id, semantic_evidence_revision)
     VALUES ($1, $2, $3, 1)`,
    [conversationId, userId, accountId]
  );
  await pool.query(
    `INSERT INTO messages (id, user_id, connected_account_id, conversation_id, provider_message_id, direction, subject, sent_at_or_received_at)
     VALUES ($1, $2, $3, $4, 'g31-message', 'INBOUND', 'G31 reducer fixture', now())`,
    [messageId, userId, accountId, conversationId]
  );

  const sourceDue: TemporalFact = {
    id: randomUUID(),
    temporalKind: 'SOURCE_DUE',
    obligationLegId: legId,
    originalExpression: '明日までに',
    valueKind: 'DATE',
    resolvedDate: '2026-09-05',
    precisionCode: 'DATE',
    currentnessStatus: 'ACCEPTED_CURRENT',
    provenance: [{evidenceKind: 'COMMUNICATED_CLAIM', messageId}]
  };
  const first = await repository.reduceCandidate(candidate({temporalFacts: [sourceDue]}));
  const firstState = stateFrom(first);
  assert(firstState.obligationLegs[0]?.bearer === 'USER', 'CREATE did not preserve USER obligation ownership.');
  assert(firstState.temporalFacts[0]?.temporalKind === 'SOURCE_DUE', 'CREATE lost SOURCE_DUE semantics.');
  assert(firstState.acceptedEvidenceRevision === 1, 'CREATE stored the wrong evidence revision.');

  const retry = await repository.reduceCandidate(candidate({temporalFacts: [sourceDue]}));
  assert(retry.status === 'APPLIED' && retry.effects[0]?.changed === true, 'idempotent replay did not return the applied domain event.');
  const countsAfterRetry = await pool.query<{responsibilities: string; events: string}>(
    `SELECT (SELECT count(*)::text FROM responsibilities) AS responsibilities,
            (SELECT count(*)::text FROM responsibility_domain_events) AS events`
  );
  assert(countsAfterRetry.rows[0]?.responsibilities === '1' && countsAfterRetry.rows[0]?.events === '1', 'retry duplicated Responsibility state or event.');

  await pool.query('UPDATE conversations SET semantic_evidence_revision = 2 WHERE id = $1', [conversationId]);
  const correctionFact: TemporalFact = {
    ...sourceDue,
    id: randomUUID(),
    resolvedDate: '2026-09-07',
    provenance: [{evidenceKind: 'USER_ASSERTION', messageId}]
  };
  const correction = await repository.reduceCandidate(candidate({
    sourceEventKey: 'g31-correction',
    candidateKey: 'g31-correction',
    applicationKey: 'g31-correction-application',
    evidenceRevision: 2,
    responsibilityRef: firstState.id,
    effects: [{
      operation: 'UPDATE',
      responsibilityRef: firstState.id,
      effectKey: 'due-correction',
      patch: {fieldChanges: [{fieldKey: 'temporalFacts.SOURCE_DUE', value: [correctionFact], authorityKind: 'USER_CORRECTION'}]}
    }]
  }));
  const correctedState = stateFrom(correction);
  assert(correctedState.temporalFacts.some((fact) => fact.currentnessStatus === 'SUPERSEDED'), 'field correction erased prior temporal evidence.');
  assert(correctedState.temporalFacts.some((fact) => fact.resolvedDate === '2026-09-07' && fact.currentnessStatus === 'ACCEPTED_CURRENT'), 'field correction did not become current.');

  await pool.query('UPDATE conversations SET semantic_evidence_revision = 3 WHERE id = $1', [conversationId]);
  const review = await repository.reduceCandidate(candidate({
    sourceEventKey: 'g31-review',
    candidateKey: 'g31-review',
    applicationKey: 'g31-review-application',
    evidenceRevision: 3,
    admission: {decision: 'NEEDS_REVIEW', reasonCodes: ['MATERIAL_CONFLICT'], candidateSummary: {field: 'SOURCE_DUE'}}
  }));
  assert(review.status === 'APPLIED' && review.admissionReview?.status === 'OPEN', 'NEEDS_REVIEW did not create an admission review.');
  assert(review.responsibilities.length === 0, 'NEEDS_REVIEW created a fake Responsibility.');

  await pool.query('UPDATE conversations SET semantic_evidence_revision = 4 WHERE id = $1', [conversationId]);
  const replacement = await repository.reduceCandidate(candidate({
    sourceEventKey: 'g31-replacement',
    candidateKey: 'g31-replacement',
    applicationKey: 'g31-replacement-application',
    evidenceRevision: 4,
    operationalOutcome: 'create a termination notice',
    obligationLegs: undefined,
    effects: [
      {operation: 'SUPERSEDE', responsibilityRef: firstState.id, effectKey: 'supersede', resolutionEvidence: {strength: 'SUFFICIENT', kinds: ['EXPLICIT_COMPLETION']}},
      {operation: 'CREATE', effectKey: 'replacement', patch: {operationalOutcome: 'create a termination notice', obligationLegs: [userLeg(randomUUID(), 'CREATE_TERMINATION_NOTICE')]}}
    ]
  }));
  const replacementState = stateFrom(replacement, 1);
  assert(stateFrom(replacement, 0).resolutionReason === 'SUPERSEDED', 'SUPERSEDE did not terminate the old Responsibility with its reason.');
  assert(replacementState.operationalOutcome === 'create a termination notice', 'replacement CREATE mutated the old operational identity.');

  const noOp = await repository.reduceCandidate(candidate({
    sourceEventKey: 'g31-no-op',
    candidateKey: 'g31-no-op',
    applicationKey: 'g31-no-op-application',
    evidenceRevision: 4,
    responsibilityRef: replacementState.id,
    effects: [{operation: 'NO_OP', responsibilityRef: replacementState.id, effectKey: 'no-op'}]
  }));
  assert(noOp.status === 'APPLIED' && noOp.effects[0]?.changed === false, 'NO_OP did not remain a non-mutating accepted effect.');

  const stale = await repository.reduceCandidate(candidate({
    sourceEventKey: 'g31-stale', candidateKey: 'g31-stale', applicationKey: 'g31-stale-application', evidenceRevision: 3, responsibilityRef: replacementState.id,
    effects: [{operation: 'UPDATE', responsibilityRef: replacementState.id, effectKey: 'stale'}]
  }));
  assert(stale.status === 'STALE', 'stale evidence revision was allowed to reach the reducer.');

  const finalCounts = await pool.query<{responsibilities: string; events: string; reviews: string; field_decisions: string; noop_mutations: string}>(
    `SELECT (SELECT count(*)::text FROM responsibilities) AS responsibilities,
            (SELECT count(*)::text FROM responsibility_domain_events) AS events,
            (SELECT count(*)::text FROM responsibility_admission_reviews) AS reviews,
            (SELECT count(*)::text FROM responsibility_field_decisions) AS field_decisions,
            (SELECT count(*)::text FROM responsibility_domain_events WHERE operation = 'NO_OP' AND NOT mutates_state) AS noop_mutations`
  );
  assert(JSON.stringify(finalCounts.rows[0]) === JSON.stringify({responsibilities: '2', events: '5', reviews: '1', field_decisions: '3', noop_mutations: '1'}), `unexpected production reducer counts: ${JSON.stringify(finalCounts.rows[0])}`);
  console.log(JSON.stringify({
    kind: 'g31-responsibility-reducer-production-result-v1',
    postgres: version.rows[0]?.version,
    checks: ['production migration targets', 'revision-serialized admission', 'idempotent CREATE', 'field-scoped correction history', 'admission Review separation', 'composite SUPERSEDE plus CREATE', 'audited NO_OP', 'stale revision rejection'],
    status: 'PASS'
  }, null, 2));
} finally {
  await pool.end();
}
