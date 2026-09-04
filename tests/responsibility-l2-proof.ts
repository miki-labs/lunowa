import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool, type PoolClient } from "pg";
import {
  assertSemanticDetails,
  emptySemanticDetails,
  promoteProposal,
  requiredLegsForDetails,
} from "../proofs/responsibility-l2/semantic-details";
import {
  proofSchema,
  proofTableNames,
  type ResponsibilitySemanticDetailsV1,
} from "../proofs/responsibility-l2/schema";

const root = resolve(import.meta.dirname, "..");
const proofRoot = resolve(root, "proofs/responsibility-l2");
const migrationsPath = resolve(proofRoot, "migrations");
const expectedPostgresVersion = "18.6";

type EvidenceStatus = "PASS" | "FAIL" | "BLOCKED" | "NOT_RUN";
type AcceptanceId = (typeof acceptanceIds)[number];

const acceptanceIds = [
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
  "31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
  "41", "42", "43", "44", "45", "46", "50", "51", "52", "53",
  "54", "55", "56", "57", "58", "59", "60",
] as const;

const acceptanceTests: Record<AcceptanceId, string> = {
  "01": "invalid RESOLVED without reason/timestamp rejected",
  "02": "DEFERRED plus HISTORICAL_INACTIVE rejected",
  "03": "one Conversation can contain multiple Responsibilities",
  "04": "account/conversation mismatch rejected",
  "05": "duplicate ACCEPTED_CURRENT parent temporal fact rejected",
  "06": "duplicate ACCEPTED_CURRENT leg temporal fact rejected",
  "07": "duplicate ACCEPTED_CURRENT event temporal fact rejected",
  "08": "multiple CONFLICT_CANDIDATE values allowed",
  "09": "DATE with resolved_at rejected",
  "10": "INSTANT with resolved_date rejected",
  "11": "UNRESOLVED retains source expression without fabricated value",
  "12": "ACCEPTED_CURRENT with superseded_at rejected",
  "13": "cross-Responsibility leg target rejected",
  "14": "cross-Responsibility event target rejected",
  "15": "multiple USER/PARTICIPANT legs allowed",
  "16": "cross-Responsibility activation event rejected",
  "17": "participant belonging to another user rejected",
  "18": "CLOSED ExpectedEvent requires closed_at",
  "19": "cancelled event closure does not require satisfied_at",
  "20": "two ACTIVE decisions for same field rejected",
  "21": "superseded decision requires superseded_at",
  "22": "two OPEN reviews for same account/source/candidate rejected",
  "23": "same source/candidate/basis review cannot be recreated after resolution",
  "24": "new basis revision can form a new review episode",
  "25": "TRACK requires admitted Responsibility",
  "26": "TRACK link to another account rejected",
  "27": "deleting tracked admitted Responsibility is restricted",
  "28": "DO_NOT_TRACK has no Responsibility requirement",
  "29": "Review resolution retry is idempotent",
  "30": "duplicate global application/effect rejected",
  "31": "concurrent duplicate CREATE leaves exactly one committed effect",
  "32": "two mutating events cannot claim one resulting version",
  "33": "NO_OP retains current version under distinct identity",
  "34": "stale aggregate command cannot overwrite current state",
  "35": "one source application atomically affects multiple Responsibilities",
  "36": "Message from another account rejected as provenance",
  "37": "DomainEvent from another Responsibility rejected as provenance",
  "38": "support role and locator work without copied body",
  "39": "parent delete removes aggregate-local state/history/provenance only",
  "40": "cross-child delete uses an explicit safe teardown order",
  "41": "Message deletion is blocked while provenance exists",
  "42": "explicit privacy deletion order succeeds",
  "43": "invalid semantic-details version/object rejected at runtime",
  "44": "duplicate local semantic-detail IDs rejected at runtime",
  "45": "unresolved ANY_OF creates no fabricated required legs",
  "46": "proposal does not become agreed fact without reducer effect/evidence",
  "50": "stale CREATE is rejected after Conversation revision advances",
  "51": "stale AdmissionReview write is rejected after revision advances",
  "52": "concurrent admission/matching serializes on Conversation",
  "53": "same-revision duplicate CREATE remains globally idempotent",
  "54": "UI/read-only changes do not advance semantic revision",
  "55": "semantic evidence advances semantic revision",
  "56": "Responsibility stores last applied, not current, evidence revision",
  "57": "AI run basis cannot label a mixed context snapshot",
  "58": "cross-user AI run cannot link to AdmissionReview",
  "59": "cross-user AI run cannot link to DomainEvent",
  "60": "cross-user AI run cannot link to Responsibility/Review provenance",
};

const acceptance = Object.fromEntries(
  acceptanceIds.map((id) => [id, { status: "NOT_RUN" as EvidenceStatus, test: acceptanceTests[id] }]),
) as Record<AcceptanceId, { status: EvidenceStatus; test: string; evidence?: string }>;

const evidence = {
  kind: "p13-runtime-result-v1",
  issue: 13,
  postgresVersion: null as string | null,
  postgresVersionNum: null as string | null,
  postgresFullVersion: null as string | null,
  toolVersions: {
    "drizzle-orm": "0.45.2",
    "drizzle-kit": "0.31.10",
    pg: "8.23.0",
    postgresTarget: expectedPostgresVersion,
  },
  proofOnlyFixtures: [
    "p13_fixture_users",
    "p13_fixture_connected_accounts",
    "p13_fixture_conversations",
    "p13_fixture_participant_identities",
    "p13_fixture_messages",
    "p13_fixture_ai_interpretation_runs",
  ],
  generatedSql: null as string | null,
  fallback: "NO ACTION plus explicit retention cleanup for optional AI-run links",
  acceptance,
  statement: "Runtime evidence only. Trusted exact-head packaging and independent Issue #15 review remain separate.",
};

class ProofBlockedError extends Error {}
class StaleBasisError extends Error {}

type Queryable = Pick<Pool, "query"> | Pick<PoolClient, "query">;
type SqlError = { code?: string; constraint?: string; message?: string };

type Fixtures = {
  user1: string;
  user2: string;
  account1: string;
  account2: string;
  conversation1: string;
  conversation2: string;
  participant1: string;
  participant2: string;
  message1: string;
  message2: string;
  run1: string;
  run2: string;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function mark(id: AcceptanceId, status: EvidenceStatus, details: string): void {
  acceptance[id] = { ...acceptance[id], status, evidence: details };
}

function markAll(status: EvidenceStatus, details: string): void {
  for (const id of acceptanceIds) {
    if (acceptance[id].status !== "PASS") mark(id, status, details);
  }
}

function isDatabaseUnavailable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; cause?: unknown };
  const codes = new Set(["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "ENETUNREACH", "ENOTFOUND", "57P03"]);
  return (
    (typeof candidate.code === "string" && codes.has(candidate.code)) ||
    (candidate.cause !== error && isDatabaseUnavailable(candidate.cause))
  );
}

function generatedSqlPath(): string {
  const file = readdirSync(migrationsPath).find((entry) => entry.endsWith(".sql"));
  if (!file) throw new ProofBlockedError("Generated Responsibility SQL is missing; run pnpm proof:responsibility-l2:schema.");
  return resolve(migrationsPath, file);
}

function readGeneratedSql(): string {
  const path = generatedSqlPath();
  const sqlText = readFileSync(path, "utf8");
  assert(existsSync(resolve(proofRoot, "schema.ts")), "Drizzle proof schema is missing.");
  assert(sqlText.includes('CREATE TABLE "responsibilities"'), "Generated SQL does not contain responsibilities.");
  assert(sqlText.includes('CREATE UNIQUE INDEX "responsibility_domain_events_application_effect_uq"'), "Global idempotency index is missing.");
  assert(sqlText.includes('FOREIGN KEY ("interpretation_run_id","user_id")'), "Composite AI-run tenant FKs are missing.");
  assert(!sqlText.includes("SET NULL ("), "Generated SQL contains an unreviewed column-list SET NULL action.");
  evidence.generatedSql = `proofs/responsibility-l2/migrations/${path.split("/").pop()}`;
  return sqlText;
}

async function resetData(pool: Pool): Promise<void> {
  const quoted = proofTableNames.map((table) => `"${table}"`).join(", ");
  await pool.query(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`);
}

async function expectPgError(
  operation: () => Promise<unknown>,
  code: string,
  constraint?: string,
): Promise<void> {
  let caught: unknown;
  try {
    await operation();
  } catch (error) {
    caught = error;
  }
  assert(caught, `Expected PostgreSQL error ${code}.`);
  const sqlError = caught as SqlError;
  assert(sqlError.code === code, `Expected SQLSTATE ${code}, got ${sqlError.code ?? "unknown"}.`);
  if (constraint) {
    assert(sqlError.constraint === constraint, `Expected constraint ${constraint}, got ${sqlError.constraint ?? "unknown"}.`);
  }
}

async function transaction<T>(pool: Pool, callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function safeRollback(client: PoolClient): Promise<void> {
  try {
    await client.query("ROLLBACK");
  } catch {
    // An unavailable connection will be discarded when released by pg.
  }
}

async function seed(pool: Pool, revision = 1): Promise<Fixtures> {
  const ids: Fixtures = {
    user1: randomUUID(),
    user2: randomUUID(),
    account1: randomUUID(),
    account2: randomUUID(),
    conversation1: randomUUID(),
    conversation2: randomUUID(),
    participant1: randomUUID(),
    participant2: randomUUID(),
    message1: randomUUID(),
    message2: randomUUID(),
    run1: randomUUID(),
    run2: randomUUID(),
  };
  await pool.query("INSERT INTO p13_fixture_users (id) VALUES ($1), ($2)", [ids.user1, ids.user2]);
  await pool.query(
    "INSERT INTO p13_fixture_connected_accounts (id, user_id) VALUES ($1, $3), ($2, $4)",
    [ids.account1, ids.account2, ids.user1, ids.user2],
  );
  await pool.query(
    "INSERT INTO p13_fixture_conversations (id, connected_account_id, semantic_evidence_revision) VALUES ($1, $3, $5), ($2, $4, $5)",
    [ids.conversation1, ids.conversation2, ids.account1, ids.account2, revision],
  );
  await pool.query(
    "INSERT INTO p13_fixture_participant_identities (id, user_id) VALUES ($1, $3), ($2, $4)",
    [ids.participant1, ids.participant2, ids.user1, ids.user2],
  );
  await pool.query(
    "INSERT INTO p13_fixture_messages (id, connected_account_id, conversation_id, evidence_revision, content_marker) VALUES ($1, $3, $5, $7, $9), ($2, $4, $6, $8, $10)",
    [ids.message1, ids.message2, ids.account1, ids.account2, ids.conversation1, ids.conversation2, revision, revision, "message-one", "message-two"],
  );
  await pool.query(
    "INSERT INTO p13_fixture_ai_interpretation_runs (id, user_id, basis_evidence_revision, context_manifest) VALUES ($1, $3, $5, $6), ($2, $4, $5, $7)",
    [ids.run1, ids.run2, ids.user1, ids.user2, revision, JSON.stringify({ messageIds: [ids.message1] }), JSON.stringify({ messageIds: [ids.message2] })],
  );
  return ids;
}

async function insertResponsibility(
  db: Queryable,
  fixtures: Fixtures,
  options: Partial<{ id: string; userId: string; accountId: string; conversationId: string; acceptedRevision: number }> = {},
): Promise<string> {
  const id = options.id ?? randomUUID();
  await db.query(
    "INSERT INTO responsibilities (id, user_id, connected_account_id, conversation_id, operational_outcome, accepted_evidence_revision) VALUES ($1, $2, $3, $4, $5, $6)",
    [id, options.userId ?? fixtures.user1, options.accountId ?? fixtures.account1, options.conversationId ?? fixtures.conversation1, "send the agreed response", options.acceptedRevision ?? 1],
  );
  return id;
}

async function insertExpected(
  db: Queryable,
  responsibilityId: string,
  userId: string,
  options: Partial<{ id: string; actorKind: "EXTERNAL" | "PARTICIPANT"; participantId: string; status: string; closureReason: string; satisfiedAt: Date; closedAt: Date }> = {},
): Promise<string> {
  const id = options.id ?? randomUUID();
  await db.query(
    "INSERT INTO responsibility_expected_events (id, responsibility_id, user_id, actor_kind, actor_participant_id, event_code, event_status, closure_reason, satisfied_at, closed_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
    [id, responsibilityId, userId, options.actorKind ?? "EXTERNAL", options.participantId ?? null, "reply-received", options.status ?? "PENDING", options.closureReason ?? null, options.satisfiedAt ?? null, options.closedAt ?? null],
  );
  return id;
}

async function insertLeg(
  db: Queryable,
  responsibilityId: string,
  userId: string,
  options: Partial<{ id: string; bearerKind: "USER" | "PARTICIPANT"; participantId: string; activationEventId: string; actionability: string }> = {},
): Promise<string> {
  const id = options.id ?? randomUUID();
  await db.query(
    "INSERT INTO responsibility_obligation_legs (id, responsibility_id, user_id, bearer_kind, bearer_participant_id, action_code, actionability, basis_kind, activation_event_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
    [id, responsibilityId, userId, options.bearerKind ?? "USER", options.participantId ?? null, "reply", options.actionability ?? "ACTIONABLE", "accepted-commitment", options.activationEventId ?? null],
  );
  return id;
}

async function insertTemporal(
  db: Queryable,
  responsibilityId: string,
  options: Partial<{ id: string; kind: string; legId: string; eventId: string; expression: string; valueKind: string; date: string | null; instant: Date | null; currentness: string; supersededAt: Date | null }> = {},
): Promise<string> {
  const id = options.id ?? randomUUID();
  await db.query(
    "INSERT INTO responsibility_temporal_facts (id, responsibility_id, temporal_kind, obligation_leg_id, expected_event_id, original_expression, value_kind, resolved_date, resolved_at, precision_code, currentness_status, superseded_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
    [id, responsibilityId, options.kind ?? "SOURCE_DUE", options.legId ?? null, options.eventId ?? null, options.expression ?? null, options.valueKind ?? "DATE", options.date === undefined ? "2030-01-02" : options.date, options.instant === undefined ? null : options.instant, "DAY", options.currentness ?? "ACCEPTED_CURRENT", options.supersededAt === undefined ? null : options.supersededAt],
  );
  return id;
}

async function insertReview(
  db: Queryable,
  fixtures: Fixtures,
  options: Partial<{ id: string; userId: string; accountId: string; conversationId: string; status: string; resolution: string; basis: number; source: string; candidate: string; runId: string; responsibilityId: string; actor: string; resolvedAt: Date }> = {},
): Promise<string> {
  const id = options.id ?? randomUUID();
  await db.query(
    "INSERT INTO responsibility_admission_reviews (id, user_id, connected_account_id, conversation_id, review_status, resolution, reason_codes, basis_evidence_revision, source_event_key, candidate_key, interpretation_run_id, admitted_responsibility_id, resolved_by_actor_kind, resolved_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)",
    [id, options.userId ?? fixtures.user1, options.accountId ?? fixtures.account1, options.conversationId ?? fixtures.conversation1, options.status ?? "OPEN", options.resolution ?? null, ["ambiguous-language"], options.basis ?? 1, options.source ?? `source-${id}`, options.candidate ?? `candidate-${id}`, options.runId ?? null, options.responsibilityId ?? null, options.actor ?? null, options.resolvedAt ?? null],
  );
  return id;
}

async function insertDomainEvent(
  db: Queryable,
  fixtures: Fixtures,
  responsibilityId: string,
  options: Partial<{ id: string; userId: string; operation: string; before: number; after: number; mutates: boolean; source: string; application: string; effect: string; runId: string }> = {},
): Promise<string> {
  const id = options.id ?? randomUUID();
  await db.query(
    "INSERT INTO responsibility_domain_events (id, responsibility_id, user_id, operation, actor_kind, reason_codes, basis_evidence_revision, aggregate_version_before, aggregate_version_after, mutates_state, source_event_key, application_key, effect_key, correlation_id, reducer_version, interpretation_run_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)",
    [id, responsibilityId, options.userId ?? fixtures.user1, options.operation ?? "CREATE", "proof-test", ["test"], 1, options.before ?? 0, options.after ?? 1, options.mutates ?? true, options.source ?? `source-${id}`, options.application ?? `application-${id}`, options.effect ?? `effect-${id}`, randomUUID(), "p13-proof-v1", options.runId ?? null],
  );
  return id;
}

async function insertField(db: Queryable, responsibilityId: string, status = "ACTIVE", supersededAt: Date | null = null): Promise<void> {
  await db.query(
    "INSERT INTO responsibility_field_decisions (responsibility_id, field_key, value_jsonb, authority_kind, basis_evidence_revision, decision_status, superseded_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [responsibilityId, "action", JSON.stringify({ code: "reply" }), "USER_ACCEPTED", 1, status, supersededAt],
  );
}

async function insertProvenance(
  db: Queryable,
  fixtures: Fixtures,
  options: Partial<{ userId: string; accountId: string; responsibilityId: string; reviewId: string; messageId: string; runId: string; eventId: string; providerKey: string; supportRole: string; locator: Record<string, unknown>; excerpt: string }> = {},
): Promise<string> {
  const id = randomUUID();
  await db.query(
    "INSERT INTO responsibility_provenance_refs (id, user_id, connected_account_id, responsibility_id, admission_review_id, target_kind, target_id, field_key, support_role, evidence_kind, message_id, provider_observation_key, interpretation_run_id, domain_event_id, source_locator, source_excerpt_short) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)",
    [id, options.userId ?? fixtures.user1, options.accountId ?? fixtures.account1, options.responsibilityId ?? null, options.reviewId ?? null, "responsibility", null, "action", options.supportRole ?? "COMMUNICATIVE_FORCE", "message", options.messageId ?? null, options.providerKey ?? null, options.runId ?? null, options.eventId ?? null, JSON.stringify(options.locator ?? { messageId: options.messageId ?? "external" }), options.excerpt ?? null],
  );
  return id;
}

function stableKey(...parts: (string | number)[]): string {
  return `p13_${createHash("sha256").update(parts.join("\u001f")).digest("hex").slice(0, 48)}`;
}

function createBarrier(parties: number): () => Promise<void> {
  let arrived = 0;
  let release!: () => void;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  return async () => {
    arrived += 1;
    if (arrived === parties) release();
    await released;
  };
}

async function currentRevision(db: Queryable, conversationId: string, lock = false): Promise<number> {
  const result = await db.query<{ semantic_evidence_revision: number }>(
    `SELECT semantic_evidence_revision FROM p13_fixture_conversations WHERE id = $1${lock ? " FOR UPDATE" : ""}`,
    [conversationId],
  );
  assert(result.rows[0], "Conversation is missing.");
  return Number(result.rows[0].semantic_evidence_revision);
}

async function requireFreshBasis(db: Queryable, conversationId: string, basis: number): Promise<number> {
  const current = await currentRevision(db, conversationId, true);
  if (current !== basis) throw new StaleBasisError(`basis ${basis} is stale; Conversation is at ${current}`);
  return current;
}

async function advanceSemanticEvidence(pool: Pool, fixtures: Fixtures, marker: string): Promise<number> {
  return transaction(pool, async (client) => {
    const current = await currentRevision(client, fixtures.conversation1, true);
    const next = current + 1;
    await client.query("UPDATE p13_fixture_conversations SET semantic_evidence_revision = $2 WHERE id = $1", [fixtures.conversation1, next]);
    await client.query(
      "INSERT INTO p13_fixture_messages (id, connected_account_id, conversation_id, evidence_revision, content_marker) VALUES ($1, $2, $3, $4, $5)",
      [randomUUID(), fixtures.account1, fixtures.conversation1, next, marker],
    );
    return next;
  });
}

async function runCase(pool: Pool, id: AcceptanceId, test: () => Promise<string>): Promise<void> {
  try {
    mark(id, "PASS", await test());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    mark(id, "FAIL", message);
    console.error(`P13 ${id} FAILED: ${message}`);
  }
}

async function runParentAndTemporalCases(pool: Pool): Promise<void> {
  await runCase(pool, "01", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    await expectPgError(
      () => pool.query(
        "INSERT INTO responsibilities (user_id, connected_account_id, conversation_id, operational_outcome, resolution_status, accepted_evidence_revision) VALUES ($1, $2, $3, $4, 'RESOLVED', 1)",
        [fixtures.user1, fixtures.account1, fixtures.conversation1, "invalid"],
      ),
      "23514",
      "responsibilities_resolution_consistency_check",
    );
    return "PostgreSQL SQLSTATE 23514 identifies responsibilities_resolution_consistency_check.";
  });

  await runCase(pool, "02", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    await expectPgError(
      () => pool.query(
        "INSERT INTO responsibilities (user_id, connected_account_id, conversation_id, operational_outcome, attention_mode, live_tracking_state, accepted_evidence_revision) VALUES ($1, $2, $3, $4, 'DEFERRED', 'HISTORICAL_INACTIVE', 1)",
        [fixtures.user1, fixtures.account1, fixtures.conversation1, "invalid"],
      ),
      "23514",
      "responsibilities_deferred_state_check",
    );
    return "PostgreSQL rejected DEFERRED plus HISTORICAL_INACTIVE with the named check.";
  });

  await runCase(pool, "03", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    await insertResponsibility(pool, fixtures);
    await insertResponsibility(pool, fixtures);
    const result = await pool.query<{ count: string }>(
      "SELECT count(*)::text AS count FROM responsibilities WHERE conversation_id = $1",
      [fixtures.conversation1],
    );
    assert(result.rows[0]?.count === "2", "Conversation did not retain two Responsibilities.");
    return "Two distinct Responsibility rows committed under one Conversation.";
  });

  await runCase(pool, "04", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    await expectPgError(
      () => insertResponsibility(pool, fixtures, { accountId: fixtures.account1, conversationId: fixtures.conversation2 }),
      "23503",
      "responsibilities_conversation_account_fk",
    );
    return "Composite Conversation/account FK rejected the mismatched account.";
  });

  await runCase(pool, "05", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await insertTemporal(pool, responsibilityId);
    await expectPgError(
      () => insertTemporal(pool, responsibilityId),
      "23505",
      "responsibility_temporal_current_parent_uq",
    );
    return "Partial unique parent temporal index rejected the duplicate current fact.";
  });

  await runCase(pool, "06", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    const legId = await insertLeg(pool, responsibilityId, fixtures.user1);
    await insertTemporal(pool, responsibilityId, { legId });
    await expectPgError(
      () => insertTemporal(pool, responsibilityId, { legId }),
      "23505",
      "responsibility_temporal_current_leg_uq",
    );
    return "Partial unique leg temporal index rejected the duplicate current fact.";
  });

  await runCase(pool, "07", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    const eventId = await insertExpected(pool, responsibilityId, fixtures.user1);
    await insertTemporal(pool, responsibilityId, { eventId });
    await expectPgError(
      () => insertTemporal(pool, responsibilityId, { eventId }),
      "23505",
      "responsibility_temporal_current_event_uq",
    );
    return "Partial unique expected-event temporal index rejected the duplicate current fact.";
  });

  await runCase(pool, "08", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await insertTemporal(pool, responsibilityId, { currentness: "CONFLICT_CANDIDATE", date: "2030-01-02" });
    await insertTemporal(pool, responsibilityId, { currentness: "CONFLICT_CANDIDATE", date: "2030-01-03" });
    const result = await pool.query<{ count: string }>(
      "SELECT count(*)::text AS count FROM responsibility_temporal_facts WHERE responsibility_id = $1 AND currentness_status = 'CONFLICT_CANDIDATE'",
      [responsibilityId],
    );
    assert(result.rows[0]?.count === "2", "Conflict candidates did not coexist.");
    return "Two conflicting temporal candidates coexist while current uniqueness is partial.";
  });

  await runCase(pool, "09", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await expectPgError(
      () => insertTemporal(pool, responsibilityId, { valueKind: "DATE", instant: new Date("2030-01-02T00:00:00Z") }),
      "23514",
      "responsibility_temporal_facts_value_shape_check",
    );
    return "DATE plus resolved_at was rejected by the value-shape check.";
  });

  await runCase(pool, "10", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await expectPgError(
      () => insertTemporal(pool, responsibilityId, { valueKind: "INSTANT", date: "2030-01-02", instant: null }),
      "23514",
      "responsibility_temporal_facts_value_shape_check",
    );
    return "INSTANT plus resolved_date without resolved_at was rejected by the value-shape check.";
  });

  await runCase(pool, "11", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await insertTemporal(pool, responsibilityId, { valueKind: "UNRESOLVED", date: null, instant: null, expression: "sometime next week" });
    const result = await pool.query<{ original_expression: string; resolved_date: string | null; resolved_at: Date | null }>(
      "SELECT original_expression, resolved_date, resolved_at FROM responsibility_temporal_facts WHERE responsibility_id = $1",
      [responsibilityId],
    );
    assert(result.rows[0]?.original_expression === "sometime next week", "Unresolved expression was not retained.");
    assert(result.rows[0].resolved_date === null && result.rows[0].resolved_at === null, "Unresolved fact fabricated a value.");
    return "UNRESOLVED retained the source expression and both resolved value columns remained NULL.";
  });

  await runCase(pool, "12", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await expectPgError(
      () => insertTemporal(pool, responsibilityId, { supersededAt: new Date("2030-01-02T00:00:00Z") }),
      "23514",
      "responsibility_temporal_facts_superseded_time_check",
    );
    return "ACCEPTED_CURRENT plus superseded_at was rejected by the currentness check.";
  });

  await runCase(pool, "13", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const first = await insertResponsibility(pool, fixtures);
    const second = await insertResponsibility(pool, fixtures);
    const foreignLeg = await insertLeg(pool, second, fixtures.user1);
    await expectPgError(
      () => insertTemporal(pool, first, { legId: foreignLeg }),
      "23503",
      "responsibility_temporal_facts_leg_parent_fk",
    );
    return "Composite leg/Responsibility FK rejected a cross-Responsibility target.";
  });

  await runCase(pool, "14", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const first = await insertResponsibility(pool, fixtures);
    const second = await insertResponsibility(pool, fixtures);
    const foreignEvent = await insertExpected(pool, second, fixtures.user1);
    await expectPgError(
      () => insertTemporal(pool, first, { eventId: foreignEvent }),
      "23503",
      "responsibility_temporal_facts_event_parent_fk",
    );
    return "Composite event/Responsibility FK rejected a cross-Responsibility target.";
  });

  await runCase(pool, "15", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await insertLeg(pool, responsibilityId, fixtures.user1, { bearerKind: "USER" });
    await insertLeg(pool, responsibilityId, fixtures.user1, { bearerKind: "PARTICIPANT", participantId: fixtures.participant1 });
    const result = await pool.query<{ count: string }>(
      "SELECT count(*)::text AS count FROM responsibility_obligation_legs WHERE responsibility_id = $1",
      [responsibilityId],
    );
    assert(result.rows[0]?.count === "2", "USER and PARTICIPANT legs did not coexist.");
    return "USER and same-user PARTICIPANT obligation legs committed for one Responsibility.";
  });

  await runCase(pool, "16", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const first = await insertResponsibility(pool, fixtures);
    const second = await insertResponsibility(pool, fixtures);
    const foreignEvent = await insertExpected(pool, second, fixtures.user1);
    await expectPgError(
      () => insertLeg(pool, first, fixtures.user1, { activationEventId: foreignEvent }),
      "23503",
      "responsibility_obligation_legs_activation_event_parent_fk",
    );
    return "NO ACTION composite activation FK rejected an event owned by another Responsibility.";
  });

  await runCase(pool, "17", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await expectPgError(
      () => insertLeg(pool, responsibilityId, fixtures.user1, { bearerKind: "PARTICIPANT", participantId: fixtures.participant2 }),
      "23503",
      "responsibility_obligation_legs_participant_user_fk",
    );
    return "Composite participant/user FK rejected a participant belonging to another user.";
  });

  await runCase(pool, "18", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await expectPgError(
      () => insertExpected(pool, responsibilityId, fixtures.user1, { status: "CLOSED", closureReason: "CANCELLED" }),
      "23514",
      "responsibility_expected_events_closure_check",
    );
    return "CLOSED ExpectedEvent without closed_at was rejected.";
  });

  await runCase(pool, "19", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await insertExpected(pool, responsibilityId, fixtures.user1, {
      status: "CLOSED",
      closureReason: "CANCELLED",
      closedAt: new Date("2030-01-02T00:00:00Z"),
    });
    return "CANCELLED closure committed with closed_at and without fabricated satisfied_at.";
  });
}

async function runReviewAndIdempotencyCases(pool: Pool): Promise<void> {
  await runCase(pool, "20", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await insertField(pool, responsibilityId);
    await expectPgError(
      () => insertField(pool, responsibilityId),
      "23505",
      "responsibility_field_decisions_active_uq",
    );
    return "Partial unique active FieldDecision index rejected the second decision for the same field.";
  });

  await runCase(pool, "21", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await expectPgError(
      () => insertField(pool, responsibilityId, "SUPERSEDED"),
      "23514",
      "responsibility_field_decisions_superseded_check",
    );
    return "SUPERSEDED FieldDecision without superseded_at was rejected.";
  });

  await runCase(pool, "22", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const source = "same-source";
    const candidate = "same-candidate";
    await insertReview(pool, fixtures, { source, candidate, basis: 1 });
    await expectPgError(
      () => insertReview(pool, fixtures, { source, candidate, basis: 2 }),
      "23505",
      "responsibility_admission_reviews_open_source_candidate_uq",
    );
    return "Partial unique OPEN Review index rejected a duplicate account/source/candidate.";
  });

  await runCase(pool, "23", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const source = "resolved-source";
    const candidate = "resolved-candidate";
    await insertReview(pool, fixtures, {
      source,
      candidate,
      status: "RESOLVED",
      resolution: "DO_NOT_TRACK",
      actor: "USER",
      resolvedAt: new Date("2030-01-02T00:00:00Z"),
    });
    await expectPgError(
      () => insertReview(pool, fixtures, { source, candidate }),
      "23505",
      "responsibility_admission_reviews_same_revision_uq",
    );
    return "All-status source/candidate/basis uniqueness prevented same-revision Review resurrection.";
  });

  await runCase(pool, "24", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const source = "evolving-source";
    const candidate = "evolving-candidate";
    await insertReview(pool, fixtures, { source, candidate, basis: 1, status: "RESOLVED", resolution: "DO_NOT_TRACK", actor: "USER", resolvedAt: new Date("2030-01-02T00:00:00Z") });
    await insertReview(pool, fixtures, { source, candidate, basis: 2 });
    const result = await pool.query<{ count: string }>(
      "SELECT count(*)::text AS count FROM responsibility_admission_reviews WHERE source_event_key = $1",
      [source],
    );
    assert(result.rows[0]?.count === "2", "A newer evidence basis could not form a new Review episode.");
    return "Basis revision 2 formed a distinct Review episode after the resolved revision 1 record.";
  });

  await runCase(pool, "25", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    await expectPgError(
      () => insertReview(pool, fixtures, { status: "RESOLVED", resolution: "TRACK", actor: "USER", resolvedAt: new Date("2030-01-02T00:00:00Z") }),
      "23514",
      "responsibility_admission_reviews_resolution_shape_check",
    );
    return "TRACK Review without an admitted Responsibility was rejected.";
  });

  await runCase(pool, "26", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const otherAccountResponsibility = await insertResponsibility(pool, fixtures, { userId: fixtures.user2, accountId: fixtures.account2, conversationId: fixtures.conversation2 });
    await expectPgError(
      () => insertReview(pool, fixtures, { responsibilityId: otherAccountResponsibility, status: "RESOLVED", resolution: "TRACK", actor: "USER", resolvedAt: new Date("2030-01-02T00:00:00Z") }),
      "23503",
      "responsibility_admission_reviews_admitted_account_fk",
    );
    return "Composite admitted Responsibility/account FK rejected a cross-account TRACK link.";
  });

  await runCase(pool, "27", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await insertReview(pool, fixtures, { status: "RESOLVED", resolution: "TRACK", actor: "USER", resolvedAt: new Date("2030-01-02T00:00:00Z"), responsibilityId });
    await expectPgError(
      () => pool.query("DELETE FROM responsibilities WHERE id = $1", [responsibilityId]),
      "23001",
      "responsibility_admission_reviews_admitted_account_fk",
    );
    const result = await pool.query<{ count: string }>("SELECT count(*)::text AS count FROM responsibility_admission_reviews WHERE admitted_responsibility_id = $1", [responsibilityId]);
    assert(result.rows[0]?.count === "1", "TRACK Review history disappeared after restricted delete.");
    return "RESTRICT preserved the tracked Review history and blocked Responsibility deletion.";
  });

  await runCase(pool, "28", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    await insertReview(pool, fixtures, { status: "RESOLVED", resolution: "DO_NOT_TRACK", actor: "USER", resolvedAt: new Date("2030-01-02T00:00:00Z") });
    const result = await pool.query<{ count: string }>("SELECT count(*)::text AS count FROM responsibilities");
    assert(result.rows[0]?.count === "0", "DO_NOT_TRACK unexpectedly created a Responsibility.");
    return "DO_NOT_TRACK Review committed without a Responsibility row.";
  });

  await runCase(pool, "29", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const reviewId = await insertReview(pool, fixtures);
    const resolveReview = async (): Promise<string> =>
      transaction(pool, async (client) => {
        const row = await client.query<{ review_status: string; resolution: string | null }>("SELECT review_status, resolution FROM responsibility_admission_reviews WHERE id = $1 FOR UPDATE", [reviewId]);
        assert(row.rows[0], "Review disappeared during retry.");
        if (row.rows[0].review_status === "RESOLVED") return row.rows[0].resolution ?? "";
        await client.query("UPDATE responsibility_admission_reviews SET review_status = 'RESOLVED', resolution = 'DO_NOT_TRACK', resolved_by_actor_kind = 'USER', resolved_at = now(), aggregate_version = aggregate_version + 1 WHERE id = $1", [reviewId]);
        return "DO_NOT_TRACK";
      });
    const first = await resolveReview();
    const second = await resolveReview();
    assert(first === "DO_NOT_TRACK" && second === "DO_NOT_TRACK", "Review retry changed its terminal result.");
    const result = await pool.query<{ count: string }>("SELECT count(*)::text AS count FROM responsibility_admission_reviews WHERE id = $1", [reviewId]);
    assert(result.rows[0]?.count === "1", "Review retry created a duplicate row.");
    return "Two locked resolution attempts returned the same terminal result and retained one Review row.";
  });

  await runCase(pool, "30", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    const application = stableKey(fixtures.account1, "source-30", 1, "candidate");
    const effect = stableKey("CREATE", "responsibility");
    await insertDomainEvent(pool, fixtures, responsibilityId, { operation: "NO_OP", before: 1, after: 1, mutates: false, application, effect });
    await expectPgError(
      () => insertDomainEvent(pool, fixtures, responsibilityId, { operation: "NO_OP", before: 1, after: 1, mutates: false, application, effect }),
      "23505",
      "responsibility_domain_events_application_effect_uq",
    );
    return "Global application/effect unique index rejected a duplicate semantic application.";
  });

  await runCase(pool, "36", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await expectPgError(
      () => insertProvenance(pool, fixtures, { responsibilityId, accountId: fixtures.account1, messageId: fixtures.message2 }),
      "23503",
      "responsibility_provenance_refs_message_account_fk",
    );
    return "Composite Message/account provenance FK rejected a Message from another connected account.";
  });

  await runCase(pool, "37", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const first = await insertResponsibility(pool, fixtures);
    const second = await insertResponsibility(pool, fixtures);
    const eventId = await insertDomainEvent(pool, fixtures, second);
    await expectPgError(
      () => insertProvenance(pool, fixtures, { responsibilityId: first, eventId }),
      "23503",
      "responsibility_provenance_refs_domain_event_parent_fk",
    );
    return "Composite DomainEvent/Responsibility provenance FK rejected a cross-Responsibility event.";
  });

  await runCase(pool, "38", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await insertProvenance(pool, fixtures, { responsibilityId, providerKey: "provider-observation-38", supportRole: "OBJECT_CONTEXT", locator: { providerMessageId: "m-38", range: "subject" } });
    const result = await pool.query<{ support_role: string; source_locator: Record<string, unknown>; source_excerpt_short: string | null }>("SELECT support_role, source_locator, source_excerpt_short FROM responsibility_provenance_refs WHERE responsibility_id = $1", [responsibilityId]);
    assert(result.rows[0]?.support_role === "OBJECT_CONTEXT", "Support role was not retained.");
    assert(result.rows[0].source_locator.providerMessageId === "m-38", "Source locator was not retained.");
    assert(result.rows[0].source_excerpt_short === null, "Proof copied a full source body.");
    return "Provider-key provenance retained a support role and bounded locator without a copied body.";
  });
}

async function runConcurrencyAndHistoryCases(pool: Pool): Promise<void> {
  await runCase(pool, "31", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const clientA = await pool.connect();
    const clientB = await pool.connect();
    const responsibilityA = randomUUID();
    const responsibilityB = randomUUID();
    const application = stableKey(fixtures.account1, "same-source-31", 1, "same-candidate");
    const effect = stableKey("CREATE", "responsibility");
    try {
      await Promise.all([clientA.query("BEGIN"), clientB.query("BEGIN")]);
      await Promise.all([
        insertResponsibility(clientA, fixtures, { id: responsibilityA }),
        insertResponsibility(clientB, fixtures, { id: responsibilityB }),
      ]);
      const bothTransactionsReady = createBarrier(2);
      await Promise.all([bothTransactionsReady(), bothTransactionsReady()]);
      await insertDomainEvent(clientA, fixtures, responsibilityA, { application, effect });
      const losingInsert = insertDomainEvent(clientB, fixtures, responsibilityB, { application, effect });
      await clientA.query("COMMIT");
      await expectPgError(() => losingInsert, "23505", "responsibility_domain_events_application_effect_uq");
      await clientB.query("ROLLBACK");
    } finally {
      await safeRollback(clientA);
      await safeRollback(clientB);
      clientA.release();
      clientB.release();
    }
    const result = await pool.query<{ parent_count: string; event_count: string }>(
      "SELECT (SELECT count(*) FROM responsibilities WHERE id IN ($1, $2))::text AS parent_count, (SELECT count(*) FROM responsibility_domain_events WHERE application_key = $3 AND effect_key = $4)::text AS event_count",
      [responsibilityA, responsibilityB, application, effect],
    );
    assert(result.rows[0]?.parent_count === "1" && result.rows[0].event_count === "1", "Concurrent duplicate CREATE left more or fewer than one committed effect.");
    return "Two real transactions generated different target UUIDs; the unique application/effect race committed one parent/event and rolled back the loser parent.";
  });

  await runCase(pool, "32", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await insertDomainEvent(pool, fixtures, responsibilityId, { before: 0, after: 1, mutates: true });
    await expectPgError(
      () => insertDomainEvent(pool, fixtures, responsibilityId, { before: 0, after: 1, mutates: true }),
      "23505",
      "responsibility_domain_events_mutation_version_uq",
    );
    return "Mutation-version unique index rejected a second mutating event claiming aggregate version 1.";
  });

  await runCase(pool, "33", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await insertDomainEvent(pool, fixtures, responsibilityId, { operation: "NO_OP", before: 1, after: 1, mutates: false, application: "noop-33-a", effect: "noop-33-a" });
    await insertDomainEvent(pool, fixtures, responsibilityId, { operation: "NO_OP", before: 1, after: 1, mutates: false, application: "noop-33-b", effect: "noop-33-b" });
    const result = await pool.query<{ count: string }>("SELECT count(*)::text AS count FROM responsibility_domain_events WHERE responsibility_id = $1 AND operation = 'NO_OP'", [responsibilityId]);
    assert(result.rows[0]?.count === "2", "Distinct NO_OP identities did not coexist at the current version.");
    return "Two distinct NO_OP application/effect identities retained aggregate version 1 without claiming mutations.";
  });

  await runCase(pool, "34", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    const clientA = await pool.connect();
    const clientB = await pool.connect();
    try {
      await Promise.all([clientA.query("BEGIN"), clientB.query("BEGIN")]);
      const bothTransactionsReady = createBarrier(2);
      await Promise.all([bothTransactionsReady(), bothTransactionsReady()]);
      const winningUpdate = clientA.query<{ aggregate_version: number }>("UPDATE responsibilities SET operational_outcome = 'winner', aggregate_version = aggregate_version + 1 WHERE id = $1 AND aggregate_version = 1 RETURNING aggregate_version", [responsibilityId]);
      await winningUpdate;
      const staleUpdate = clientB.query("UPDATE responsibilities SET operational_outcome = 'stale-writer', aggregate_version = aggregate_version + 1 WHERE id = $1 AND aggregate_version = 1 RETURNING aggregate_version", [responsibilityId]);
      await clientA.query("COMMIT");
      const staleResult = await staleUpdate;
      assert(staleResult.rowCount === 0, "A stale aggregate update overwrote current state.");
      await clientB.query("COMMIT");
    } finally {
      await safeRollback(clientA);
      await safeRollback(clientB);
      clientA.release();
      clientB.release();
    }
    const result = await pool.query<{ operational_outcome: string; aggregate_version: number }>("SELECT operational_outcome, aggregate_version FROM responsibilities WHERE id = $1", [responsibilityId]);
    assert(result.rows[0]?.operational_outcome === "winner" && Number(result.rows[0].aggregate_version) === 2, "The winning aggregate state was not retained.");
    return "Two real connections raced an expected-version update; one committed and the stale writer updated zero rows.";
  });

  await runCase(pool, "35", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const first = await insertResponsibility(pool, fixtures);
    const second = await insertResponsibility(pool, fixtures);
    const application = "atomic-application-35";
    const effect = "atomic-effect-35";
    let caught: unknown;
    try {
      await transaction(pool, async (client) => {
        await client.query("UPDATE responsibilities SET aggregate_version = 2 WHERE id IN ($1, $2) AND aggregate_version = 1", [first, second]);
        await insertDomainEvent(client, fixtures, first, { application, effect });
        await insertDomainEvent(client, fixtures, second, { application, effect });
      });
    } catch (error) {
      caught = error;
    }
    assert((caught as SqlError | undefined)?.code === "23505", "The composite effect did not fail at the global idempotency boundary.");
    const result = await pool.query<{ version: string; events: string }>(
      "SELECT (SELECT string_agg(aggregate_version::text, ',' ORDER BY id) FROM responsibilities WHERE id IN ($1, $2)) AS version, (SELECT count(*)::text FROM responsibility_domain_events WHERE application_key = $3 AND effect_key = $4) AS events",
      [first, second, application, effect],
    );
    assert(result.rows[0]?.version === "1,1" && result.rows[0].events === "0", "A failed second effect partially committed the first Responsibility.");
    return "A forced second-effect uniqueness failure rolled back both Responsibility updates and the first event in one transaction.";
  });
}

async function runDeleteAndSemanticCases(pool: Pool): Promise<void> {
  await runCase(pool, "39", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await insertExpected(pool, responsibilityId, fixtures.user1);
    await insertLeg(pool, responsibilityId, fixtures.user1);
    await insertTemporal(pool, responsibilityId);
    await insertField(pool, responsibilityId);
    await insertDomainEvent(pool, fixtures, responsibilityId);
    await insertProvenance(pool, fixtures, { responsibilityId, providerKey: "local-history-39" });
    await pool.query("DELETE FROM responsibilities WHERE id = $1", [responsibilityId]);
    const result = await pool.query<{ rows_remaining: string; fixture_rows: string }>(
      "SELECT (SELECT count(*) FROM responsibilities WHERE id = $1) + (SELECT count(*) FROM responsibility_expected_events WHERE responsibility_id = $1) + (SELECT count(*) FROM responsibility_obligation_legs WHERE responsibility_id = $1) + (SELECT count(*) FROM responsibility_temporal_facts WHERE responsibility_id = $1) + (SELECT count(*) FROM responsibility_field_decisions WHERE responsibility_id = $1) + (SELECT count(*) FROM responsibility_domain_events WHERE responsibility_id = $1) + (SELECT count(*) FROM responsibility_provenance_refs WHERE responsibility_id = $1) AS rows_remaining, (SELECT count(*) FROM p13_fixture_users) AS fixture_rows",
      [responsibilityId],
    );
    assert(result.rows[0]?.rows_remaining === "0" && result.rows[0].fixture_rows === "2", "Parent cascade removed proof fixtures or left aggregate rows behind.");
    return "Parent CASCADE removed only aggregate-local rows/history/provenance; external proof fixtures remained.";
  });

  await runCase(pool, "40", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    const eventId = await insertExpected(pool, responsibilityId, fixtures.user1);
    const legId = await insertLeg(pool, responsibilityId, fixtures.user1, { activationEventId: eventId });
    await insertTemporal(pool, responsibilityId, { legId });
    const domainEventId = await insertDomainEvent(pool, fixtures, responsibilityId);
    await insertProvenance(pool, fixtures, { responsibilityId, eventId: domainEventId });
    let directDeleteError: unknown;
    try {
      await pool.query("DELETE FROM responsibilities WHERE id = $1", [responsibilityId]);
    } catch (error) {
      directDeleteError = error;
    }
    if (!directDeleteError) {
      const remaining = await pool.query<{ count: string }>("SELECT (SELECT count(*) FROM responsibility_obligation_legs WHERE responsibility_id = $1) + (SELECT count(*) FROM responsibility_expected_events WHERE responsibility_id = $1) + (SELECT count(*) FROM responsibility_temporal_facts WHERE responsibility_id = $1) + (SELECT count(*) FROM responsibility_provenance_refs WHERE responsibility_id = $1) AS count", [responsibilityId]);
      assert(remaining.rows[0]?.count === "0", "Direct parent delete reported success but left cross-child rows.");
      return "PostgreSQL's cascade execution safely removed the cross-child graph in one parent delete.";
    }
    const sqlError = directDeleteError as SqlError | undefined;
    assert(sqlError?.code === "23503", "Cross-child NO ACTION graph did not block direct parent deletion.");
    assert(
      new Set([
        "responsibility_obligation_legs_activation_event_parent_fk",
        "responsibility_temporal_facts_leg_parent_fk",
        "responsibility_provenance_refs_domain_event_parent_fk",
      ]).has(sqlError.constraint ?? ""),
      `Unexpected cross-child delete constraint: ${sqlError.constraint ?? "unknown"}`,
    );
    await pool.query("DELETE FROM responsibility_provenance_refs WHERE responsibility_id = $1", [responsibilityId]);
    await pool.query("DELETE FROM responsibility_temporal_facts WHERE responsibility_id = $1", [responsibilityId]);
    await pool.query("DELETE FROM responsibility_obligation_legs WHERE responsibility_id = $1", [responsibilityId]);
    await pool.query("DELETE FROM responsibility_expected_events WHERE responsibility_id = $1", [responsibilityId]);
    await pool.query("DELETE FROM responsibility_domain_events WHERE responsibility_id = $1", [responsibilityId]);
    await pool.query("DELETE FROM responsibilities WHERE id = $1", [responsibilityId]);
    return "Direct delete was blocked by the real NO ACTION graph; documented deterministic child teardown then succeeded.";
  });

  await runCase(pool, "41", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await insertProvenance(pool, fixtures, { responsibilityId, messageId: fixtures.message1 });
    await expectPgError(
      () => pool.query("DELETE FROM p13_fixture_messages WHERE id = $1", [fixtures.message1]),
      "23001",
      "responsibility_provenance_refs_message_account_fk",
    );
    await pool.query("DELETE FROM responsibility_provenance_refs WHERE responsibility_id = $1", [responsibilityId]);
    await pool.query("DELETE FROM p13_fixture_messages WHERE id = $1", [fixtures.message1]);
    return "Message deletion was blocked until its provenance reference was explicitly removed.";
  });

  await runCase(pool, "42", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    const reviewId = await insertReview(pool, fixtures);
    await insertProvenance(pool, fixtures, { responsibilityId, messageId: fixtures.message1, runId: fixtures.run1 });
    await insertProvenance(pool, fixtures, { reviewId, runId: fixtures.run1, providerKey: "review-evidence-42" });
    await expectPgError(
      () => pool.query("DELETE FROM p13_fixture_ai_interpretation_runs WHERE id = $1", [fixtures.run1]),
      "23503",
      "responsibility_provenance_refs_interpretation_run_user_fk",
    );
    await pool.query("DELETE FROM responsibility_provenance_refs WHERE responsibility_id = $1 OR admission_review_id = $2", [responsibilityId, reviewId]);
    await pool.query("DELETE FROM responsibilities WHERE id = $1", [responsibilityId]);
    await pool.query("DELETE FROM responsibility_admission_reviews WHERE id = $1", [reviewId]);
    await pool.query("DELETE FROM p13_fixture_messages WHERE id = $1", [fixtures.message1]);
    await pool.query("DELETE FROM p13_fixture_ai_interpretation_runs WHERE id = $1", [fixtures.run1]);
    await pool.query("DELETE FROM p13_fixture_participant_identities WHERE id = $1", [fixtures.participant1]);
    await pool.query("DELETE FROM p13_fixture_conversations WHERE id = $1", [fixtures.conversation1]);
    await pool.query("DELETE FROM p13_fixture_connected_accounts WHERE id = $1", [fixtures.account1]);
    await pool.query("DELETE FROM p13_fixture_users WHERE id = $1", [fixtures.user1]);
    const result = await pool.query<{ remaining: string }>(
      "SELECT (SELECT count(*) FROM responsibilities WHERE user_id = $1) + (SELECT count(*) FROM responsibility_admission_reviews WHERE user_id = $1) + (SELECT count(*) FROM responsibility_domain_events WHERE user_id = $1) + (SELECT count(*) FROM responsibility_provenance_refs WHERE user_id = $1) + (SELECT count(*) FROM p13_fixture_ai_interpretation_runs WHERE user_id = $1) + (SELECT count(*) FROM p13_fixture_participant_identities WHERE user_id = $1) + (SELECT count(*) FROM p13_fixture_connected_accounts WHERE user_id = $1) + (SELECT count(*) FROM p13_fixture_users WHERE id = $1) + (SELECT count(*) FROM p13_fixture_messages WHERE id = $2) AS remaining",
      [fixtures.user1, fixtures.message1],
    );
    assert(result.rows[0]?.remaining === "0", "Privacy teardown left user-scoped proof data behind.");
    return "Explicit ownership-safe privacy order removed Responsibility/Review references before Message, AI run, account, and user fixture data.";
  });

  await runCase(pool, "43", async () => {
    const details = emptySemanticDetails();
    let rejected = false;
    try {
      assertSemanticDetails(details, 2);
    } catch {
      rejected = true;
    }
    assert(rejected, "Unknown semantic-details version was accepted.");
    rejected = false;
    try {
      assertSemanticDetails({ completionCriteria: [] }, 1);
    } catch {
      rejected = true;
    }
    assert(rejected, "Malformed semantic-details object was accepted.");
    return "Runtime validator rejected both an unknown version and a malformed object.";
  });

  await runCase(pool, "44", async () => {
    const details = emptySemanticDetails();
    const duplicate = {
      ...details,
      completionCriteria: [{ id: "duplicate", code: "a", status: "PENDING" as const }],
      constraints: [{ id: "duplicate", code: "b", status: "ACTIVE" as const }],
    };
    let rejected = false;
    try {
      assertSemanticDetails(duplicate, 1);
    } catch {
      rejected = true;
    }
    assert(rejected, "Duplicate local semantic-detail IDs were accepted.");
    return "Runtime validator rejected a duplicate local ID across semantic-detail collections.";
  });

  await runCase(pool, "45", async () => {
    const details: ResponsibilitySemanticDetailsV1 = {
      ...emptySemanticDetails(),
      completionCriteria: [{ id: "criterion-45", code: "reply", status: "PENDING" }],
      assignmentSemantics: { id: "assignment-45", shape: "ANY_OF", candidateParticipantIds: ["p1", "p2"] },
    };
    assert(requiredLegsForDetails(details).length === 0, "Unresolved ANY_OF fabricated a required leg.");
    return "Unresolved ANY_OF validated without selecting a participant and produced zero fabricated required legs.";
  });

  await runCase(pool, "46", async () => {
    const details: ResponsibilitySemanticDetailsV1 = {
      ...emptySemanticDetails(),
      pendingProposals: [{ id: "proposal-46", kind: "due-date", value: { date: "2030-01-02" }, status: "PENDING" }],
    };
    const unchanged = promoteProposal(details, "proposal-46", { reducerEffect: false });
    assert(unchanged.agreedFacts.length === 0 && unchanged.pendingProposals[0]?.status === "PENDING", "A proposal became an agreed fact without reducer evidence/effect.");
    return "Pending proposal remained pending and created no agreed fact without an explicit reducer effect/evidence reference.";
  });
}

async function runFreshnessAndTenantCases(pool: Pool): Promise<void> {
  await runCase(pool, "50", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const staleClient = await pool.connect();
    const evidenceClient = await pool.connect();
    try {
      await staleClient.query("BEGIN");
      const basis = await currentRevision(staleClient, fixtures.conversation1);
      await staleClient.query("COMMIT");
      await evidenceClient.query("BEGIN");
      const before = await currentRevision(evidenceClient, fixtures.conversation1, true);
      await evidenceClient.query("UPDATE p13_fixture_conversations SET semantic_evidence_revision = $2 WHERE id = $1", [fixtures.conversation1, before + 1]);
      const staleCheck = (async () => {
        await staleClient.query("BEGIN");
        try {
          await requireFreshBasis(staleClient, fixtures.conversation1, basis);
          throw new Error("stale CREATE basis was accepted");
        } finally {
          await staleClient.query("ROLLBACK");
        }
      })();
      await evidenceClient.query("COMMIT");
      await expectStale(staleCheck);
      const result = await pool.query<{ count: string }>("SELECT count(*)::text AS count FROM responsibilities WHERE conversation_id = $1", [fixtures.conversation1]);
      assert(result.rows[0]?.count === "0", "Stale CREATE inserted a Responsibility.");
      return "A basis captured on one real connection was rejected by the Conversation FOR UPDATE freshness gate after another connection advanced revision 1 to 2.";
    } finally {
      await safeRollback(staleClient);
      await safeRollback(evidenceClient);
      staleClient.release();
      evidenceClient.release();
    }
  });

  await runCase(pool, "51", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const staleClient = await pool.connect();
    const evidenceClient = await pool.connect();
    try {
      const basis = await currentRevision(staleClient, fixtures.conversation1);
      await evidenceClient.query("BEGIN");
      const before = await currentRevision(evidenceClient, fixtures.conversation1, true);
      await evidenceClient.query("UPDATE p13_fixture_conversations SET semantic_evidence_revision = $2 WHERE id = $1", [fixtures.conversation1, before + 1]);
      const staleReview = (async () => {
        await staleClient.query("BEGIN");
        try {
          await requireFreshBasis(staleClient, fixtures.conversation1, basis);
          await insertReview(staleClient, fixtures, { basis });
          throw new Error("stale Review basis was accepted");
        } finally {
          await staleClient.query("ROLLBACK");
        }
      })();
      await evidenceClient.query("COMMIT");
      await expectStale(staleReview);
      const result = await pool.query<{ count: string }>("SELECT count(*)::text AS count FROM responsibility_admission_reviews WHERE conversation_id = $1", [fixtures.conversation1]);
      assert(result.rows[0]?.count === "0", "Stale Review write committed.");
      return "The same Conversation freshness gate rejected stale AdmissionReview creation after a concurrent revision advance.";
    } finally {
      await safeRollback(staleClient);
      await safeRollback(evidenceClient);
      staleClient.release();
      evidenceClient.release();
    }
  });

  await runCase(pool, "52", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const first = await pool.connect();
    const second = await pool.connect();
    try {
      await first.query("BEGIN");
      await currentRevision(first, fixtures.conversation1, true);
      await second.query("BEGIN");
      const waitingLock = second.query("SELECT id FROM p13_fixture_conversations WHERE id = $1 FOR UPDATE", [fixtures.conversation1]);
      await new Promise((resolve) => setTimeout(resolve, 25));
      await first.query("UPDATE p13_fixture_conversations SET semantic_evidence_revision = 2 WHERE id = $1", [fixtures.conversation1]);
      await insertResponsibility(first, fixtures, { acceptedRevision: 2 });
      await first.query("COMMIT");
      await waitingLock;
      const serializedRevision = await currentRevision(second, fixtures.conversation1);
      assert(serializedRevision === 2, `Second admission saw revision ${serializedRevision}, expected 2.`);
      await insertResponsibility(second, fixtures, { acceptedRevision: 2 });
      await second.query("COMMIT");
    } finally {
      await safeRollback(first);
      await safeRollback(second);
      first.release();
      second.release();
    }
    const result = await pool.query<{ count: string; revisions: string }>("SELECT count(*)::text AS count, string_agg(accepted_evidence_revision::text, ',' ORDER BY created_at, id) AS revisions FROM responsibilities WHERE conversation_id = $1", [fixtures.conversation1]);
    assert(result.rows[0]?.count === "2" && result.rows[0].revisions === "2,2", "Conversation admission effects were not serialized on the current revision.");
    return "Two real connections contended on Conversation FOR UPDATE; the second observed the first committed revision and both accepted effects recorded revision 2.";
  });

  await runCase(pool, "53", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const application = stableKey(fixtures.account1, "same-revision-53", 1, "candidate");
    const effect = stableKey("CREATE", "same-revision");
    const first = await insertResponsibility(pool, fixtures);
    await insertDomainEvent(pool, fixtures, first, { application, effect });
    let caught: unknown;
    try {
      await transaction(pool, async (client) => {
        const second = await insertResponsibility(client, fixtures);
        await insertDomainEvent(client, fixtures, second, { application, effect });
      });
    } catch (error) {
      caught = error;
    }
    assert((caught as SqlError | undefined)?.code === "23505", "Same-revision duplicate CREATE did not reach global idempotency.");
    const result = await pool.query<{ count: string }>("SELECT count(*)::text AS count FROM responsibility_domain_events WHERE application_key = $1 AND effect_key = $2", [application, effect]);
    assert(result.rows[0]?.count === "1", "Same-revision duplicate CREATE committed more than one effect.");
    return "A second same-revision CREATE with a different generated UUID was rolled back by the global application/effect unique boundary.";
  });

  await runCase(pool, "54", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const before = await currentRevision(pool, fixtures.conversation1);
    await pool.query("UPDATE p13_fixture_conversations SET ui_read_at = now() WHERE id = $1", [fixtures.conversation1]);
    const after = await currentRevision(pool, fixtures.conversation1);
    assert(before === after, "UI/read-only update advanced semantic_evidence_revision.");
    return "Changing the proof fixture's UI/read column left semantic_evidence_revision unchanged.";
  });

  await runCase(pool, "55", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const before = await currentRevision(pool, fixtures.conversation1);
    const after = await advanceSemanticEvidence(pool, fixtures, "relevant-message-55");
    assert(after === before + 1, "Semantic evidence did not advance the Conversation revision.");
    const result = await pool.query<{ evidence_revision: number; content_marker: string }>("SELECT evidence_revision, content_marker FROM p13_fixture_messages WHERE content_marker = $1", ["relevant-message-55"]);
    assert(Number(result.rows[0]?.evidence_revision) === after && result.rows[0]?.content_marker === "relevant-message-55", "New semantic evidence did not carry the new revision.");
    return "The trusted proof append path locked Conversation, advanced revision 1 to 2, and assigned the new Message evidence revision.";
  });

  await runCase(pool, "56", async () => {
    await resetData(pool);
    const fixtures = await seed(pool, 2);
    const responsibilityId = await insertResponsibility(pool, fixtures, { acceptedRevision: 2 });
    await pool.query("UPDATE p13_fixture_conversations SET semantic_evidence_revision = 3 WHERE id = $1", [fixtures.conversation1]);
    const result = await pool.query<{ accepted_evidence_revision: number; current_revision: number }>("SELECT r.accepted_evidence_revision, c.semantic_evidence_revision AS current_revision FROM responsibilities r JOIN p13_fixture_conversations c ON c.id = r.conversation_id WHERE r.id = $1", [responsibilityId]);
    assert(Number(result.rows[0]?.accepted_evidence_revision) === 2 && Number(result.rows[0]?.current_revision) === 3, "Responsibility evidence semantics confused last-applied with current Conversation revision.");
    return "Responsibility recorded accepted_evidence_revision 2 while its Conversation moved to current revision 3.";
  });

  await runCase(pool, "57", async () => {
    await resetData(pool);
    const fixtures = await seed(pool, 1);
    const captureClient = await pool.connect();
    try {
      await captureClient.query("BEGIN");
      const basis = await currentRevision(captureClient, fixtures.conversation1, true);
      const messages = await captureClient.query<{ id: string }>("SELECT id FROM p13_fixture_messages WHERE conversation_id = $1 AND evidence_revision <= $2 ORDER BY id", [fixtures.conversation1, basis]);
      const runId = randomUUID();
      await captureClient.query("INSERT INTO p13_fixture_ai_interpretation_runs (id, user_id, basis_evidence_revision, context_manifest) VALUES ($1, $2, $3, $4)", [runId, fixtures.user1, basis, JSON.stringify({ messageIds: messages.rows.map(({ id }) => id) })]);
      await captureClient.query("COMMIT");
      const evidenceArrival = advanceSemanticEvidence(pool, fixtures, "arrived-during-model-57");
      const remoteModel = new Promise<void>((resolve) => setTimeout(resolve, 30));
      await Promise.all([evidenceArrival, remoteModel]);
      const result = await pool.query<{ basis_evidence_revision: number; context_manifest: { messageIds: string[] } }>("SELECT basis_evidence_revision, context_manifest FROM p13_fixture_ai_interpretation_runs WHERE id = $1", [runId]);
      assert(Number(result.rows[0]?.basis_evidence_revision) === 1, "AI run basis revision changed after capture.");
      assert(result.rows[0]?.context_manifest.messageIds.length === 1 && result.rows[0].context_manifest.messageIds[0] === fixtures.message1, "AI run context manifest mixed evidence from a newer revision.");
      return "Context membership and revision were captured under a short Conversation lock, then a concurrent evidence arrival advanced the Conversation during the simulated remote call without contaminating the run manifest.";
    } finally {
      captureClient.release();
    }
  });

  await runCase(pool, "58", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    await expectPgError(
      () => insertReview(pool, fixtures, { runId: fixtures.run2 }),
      "23503",
      "responsibility_admission_reviews_interpretation_run_user_fk",
    );
    return "Review composite interpretation_run_id/user_id FK rejected another user's AI run.";
  });

  await runCase(pool, "59", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    await expectPgError(
      () => insertDomainEvent(pool, fixtures, responsibilityId, { runId: fixtures.run2 }),
      "23503",
      "responsibility_domain_events_interpretation_run_user_fk",
    );
    return "DomainEvent composite interpretation_run_id/user_id FK rejected another user's AI run.";
  });

  await runCase(pool, "60", async () => {
    await resetData(pool);
    const fixtures = await seed(pool);
    const responsibilityId = await insertResponsibility(pool, fixtures);
    const reviewId = await insertReview(pool, fixtures);
    await expectPgError(
      () => insertProvenance(pool, fixtures, { responsibilityId, runId: fixtures.run2 }),
      "23503",
      "responsibility_provenance_refs_interpretation_run_user_fk",
    );
    await expectPgError(
      () => insertProvenance(pool, fixtures, { reviewId, runId: fixtures.run2 }),
      "23503",
      "responsibility_provenance_refs_interpretation_run_user_fk",
    );
    return "Responsibility-owned and Review-owned provenance both rejected another user's AI run through the composite tenant FK.";
  });
}

async function expectStale(operation: Promise<unknown>): Promise<void> {
  let caught: unknown;
  try {
    await operation;
  } catch (error) {
    caught = error;
  }
  assert(caught instanceof StaleBasisError, `Expected stale basis rejection, got ${caught instanceof Error ? caught.message : String(caught)}.`);
}

async function run(): Promise<void> {
  const databaseUrl = process.env.P13_DATABASE_URL;
  if (!databaseUrl) {
    throw new ProofBlockedError("P13_DATABASE_URL is required; the runtime proof will not substitute a mock or local fallback.");
  }

  readGeneratedSql();
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 8,
    application_name: "lunowa-p13-responsibility-l2-proof",
  });
  try {
    const versionResult = await pool.query<{ server_version: string; server_version_num: string; full_version: string }>(
      "SELECT current_setting('server_version') AS server_version, current_setting('server_version_num') AS server_version_num, version() AS full_version",
    );
    const version = versionResult.rows[0];
    assert(version, "PostgreSQL did not return server-version evidence.");
    evidence.postgresVersion = version.server_version;
    evidence.postgresVersionNum = version.server_version_num;
    evidence.postgresFullVersion = version.full_version;
    assert(version.server_version_num === "180006", `The proof requires PostgreSQL ${expectedPostgresVersion}; observed server_version=${version.server_version}, server_version_num=${version.server_version_num}.`);

    const db = drizzle(pool, { schema: proofSchema });
    await migrate(db, { migrationsFolder: migrationsPath });
    await resetData(pool);

    await runParentAndTemporalCases(pool);
    await runReviewAndIdempotencyCases(pool);
    await runConcurrencyAndHistoryCases(pool);
    await runDeleteAndSemanticCases(pool);
    await runFreshnessAndTenantCases(pool);

    assert(acceptanceIds.every((id) => acceptance[id].status === "PASS"), "One or more P13 acceptance cases did not PASS.");
  } finally {
    await pool.end();
  }
}

async function main(): Promise<void> {
  let failure: unknown;
  try {
    await run();
  } catch (error) {
    failure = error;
    const status: EvidenceStatus = error instanceof ProofBlockedError || isDatabaseUnavailable(error) ? "BLOCKED" : "FAIL";
    markAll(status, error instanceof Error ? error.message : String(error));
    console.error(`P13 runtime proof ${status}: ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log(JSON.stringify(evidence, null, 2));
  if (failure || acceptanceIds.some((id) => acceptance[id].status !== "PASS")) process.exitCode = 1;
}

await main();
