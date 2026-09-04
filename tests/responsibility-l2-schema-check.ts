import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { expectedResponsibilityTables } from "../proofs/responsibility-l2/schema";

const root = resolve(import.meta.dirname, "..");
const proofRoot = resolve(root, "proofs/responsibility-l2");
const migrationRoot = resolve(proofRoot, "migrations");

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function count(value: string, needle: string): number {
  return value.split(needle).length - 1;
}

type ExpectedIndex = {
  name: string;
  table: string;
  unique: boolean;
  columns: readonly string[];
  where?: string;
};

type GeneratedIndex = Omit<ExpectedIndex, "where"> & { where?: string };

const expectedResponsibilityIndexes: readonly ExpectedIndex[] = [
  {
    name: "responsibilities_live_open_user_idx",
    table: "responsibilities",
    unique: false,
    columns: ["user_id", "updated_at DESC", "id"],
    where: "live_tracking_state = 'TRACKING_ACTIVE' AND resolution_status = 'OPEN'",
  },
  {
    name: "responsibilities_live_done_user_idx",
    table: "responsibilities",
    unique: false,
    columns: ["user_id", "resolved_at DESC", "id"],
    where: "live_tracking_state = 'TRACKING_ACTIVE' AND resolution_status = 'RESOLVED'",
  },
  {
    name: "responsibilities_conversation_idx",
    table: "responsibilities",
    unique: false,
    columns: ["conversation_id", "created_at", "id"],
  },
  {
    name: "responsibilities_account_updated_idx",
    table: "responsibilities",
    unique: false,
    columns: ["connected_account_id", "updated_at DESC", "id"],
  },
  {
    name: "responsibility_expected_events_pending_idx",
    table: "responsibility_expected_events",
    unique: false,
    columns: ["responsibility_id", "actor_kind", "id"],
    where: "event_status = 'PENDING'",
  },
  {
    name: "responsibility_expected_events_actor_idx",
    table: "responsibility_expected_events",
    unique: false,
    columns: ["actor_participant_id", "responsibility_id"],
    where: "actor_participant_id IS NOT NULL",
  },
  {
    name: "responsibility_obligation_legs_open_projection_idx",
    table: "responsibility_obligation_legs",
    unique: false,
    columns: ["responsibility_id", "bearer_kind", "actionability", "id"],
    where: "leg_status = 'OPEN'",
  },
  {
    name: "responsibility_obligation_legs_activation_event_idx",
    table: "responsibility_obligation_legs",
    unique: false,
    columns: ["activation_event_id", "responsibility_id"],
    where: "activation_event_id IS NOT NULL",
  },
  {
    name: "responsibility_obligation_legs_participant_idx",
    table: "responsibility_obligation_legs",
    unique: false,
    columns: ["bearer_participant_id", "responsibility_id"],
    where: "bearer_participant_id IS NOT NULL",
  },
  {
    name: "responsibility_temporal_current_parent_uq",
    table: "responsibility_temporal_facts",
    unique: true,
    columns: ["responsibility_id", "temporal_kind"],
    where:
      "currentness_status = 'ACCEPTED_CURRENT' AND obligation_leg_id IS NULL AND expected_event_id IS NULL",
  },
  {
    name: "responsibility_temporal_current_leg_uq",
    table: "responsibility_temporal_facts",
    unique: true,
    columns: ["responsibility_id", "temporal_kind", "obligation_leg_id"],
    where:
      "currentness_status = 'ACCEPTED_CURRENT' AND obligation_leg_id IS NOT NULL AND expected_event_id IS NULL",
  },
  {
    name: "responsibility_temporal_current_event_uq",
    table: "responsibility_temporal_facts",
    unique: true,
    columns: ["responsibility_id", "temporal_kind", "expected_event_id"],
    where:
      "currentness_status = 'ACCEPTED_CURRENT' AND expected_event_id IS NOT NULL AND obligation_leg_id IS NULL",
  },
  {
    name: "responsibility_temporal_current_date_idx",
    table: "responsibility_temporal_facts",
    unique: false,
    columns: ["temporal_kind", "resolved_date", "responsibility_id"],
    where: "currentness_status = 'ACCEPTED_CURRENT' AND value_kind = 'DATE'",
  },
  {
    name: "responsibility_temporal_current_instant_idx",
    table: "responsibility_temporal_facts",
    unique: false,
    columns: ["temporal_kind", "resolved_at", "responsibility_id"],
    where: "currentness_status = 'ACCEPTED_CURRENT' AND value_kind = 'INSTANT'",
  },
  {
    name: "responsibility_temporal_conflict_idx",
    table: "responsibility_temporal_facts",
    unique: false,
    columns: ["responsibility_id", "temporal_kind", "id"],
    where: "currentness_status = 'CONFLICT_CANDIDATE'",
  },
  {
    name: "responsibility_field_decisions_active_uq",
    table: "responsibility_field_decisions",
    unique: true,
    columns: ["responsibility_id", "field_key"],
    where: "decision_status = 'ACTIVE'",
  },
  {
    name: "responsibility_admission_reviews_open_source_candidate_uq",
    table: "responsibility_admission_reviews",
    unique: true,
    columns: ["connected_account_id", "source_event_key", "candidate_key"],
    where: "review_status = 'OPEN'",
  },
  {
    name: "responsibility_admission_reviews_open_user_idx",
    table: "responsibility_admission_reviews",
    unique: false,
    columns: ["user_id", "created_at DESC", "id"],
    where: "review_status = 'OPEN'",
  },
  {
    name: "responsibility_admission_reviews_conversation_idx",
    table: "responsibility_admission_reviews",
    unique: false,
    columns: ["conversation_id", "created_at DESC", "id"],
  },
  {
    name: "responsibility_domain_events_application_effect_uq",
    table: "responsibility_domain_events",
    unique: true,
    columns: ["application_key", "effect_key"],
  },
  {
    name: "responsibility_domain_events_mutation_version_uq",
    table: "responsibility_domain_events",
    unique: true,
    columns: ["responsibility_id", "aggregate_version_after"],
    where: "mutates_state",
  },
  {
    name: "responsibility_domain_events_history_idx",
    table: "responsibility_domain_events",
    unique: false,
    columns: ["responsibility_id", "occurred_at DESC", "id"],
  },
  {
    name: "responsibility_domain_events_correlation_idx",
    table: "responsibility_domain_events",
    unique: false,
    columns: ["correlation_id", "id"],
  },
  {
    name: "responsibility_domain_events_source_idx",
    table: "responsibility_domain_events",
    unique: false,
    columns: ["source_event_key", "occurred_at DESC", "id"],
  },
  {
    name: "responsibility_provenance_refs_responsibility_idx",
    table: "responsibility_provenance_refs",
    unique: false,
    columns: ["responsibility_id", "target_kind", "target_id", "id"],
    where: "responsibility_id IS NOT NULL",
  },
  {
    name: "responsibility_provenance_refs_review_idx",
    table: "responsibility_provenance_refs",
    unique: false,
    columns: ["admission_review_id", "id"],
    where: "admission_review_id IS NOT NULL",
  },
  {
    name: "responsibility_provenance_refs_message_idx",
    table: "responsibility_provenance_refs",
    unique: false,
    columns: ["message_id", "id"],
    where: "message_id IS NOT NULL",
  },
];

function normalizeSqlFragment(value: string): string {
  return value
    .replace(/"[^".]+"\."([^"]+)"/g, "$1")
    .replace(/"([^"]+)"/g, "$1")
    // Drizzle 0.45.2 emits NULLS LAST with column.desc(); v0.4 specifies
    // the key direction, while the nullable ordering is not part of this
    // oracle's canonical index contract.
    .replace(/ DESC NULLS LAST\b/g, " DESC")
    .replace(/\s+/g, " ")
    .trim();
}

function parseGeneratedIndexes(value: string): Map<string, GeneratedIndex> {
  const indexes = new Map<string, GeneratedIndex>();
  const pattern =
    /DROP INDEX "([^"]+)";|CREATE (UNIQUE )?INDEX "([^"]+)" ON "([^"]+)" USING btree \(([^)]*)\)(?: WHERE ([^;]*))?;/g;

  for (const match of value.matchAll(pattern)) {
    const [, droppedName, unique, name, table, columns, where] = match;
    if (droppedName !== undefined) {
      assert(indexes.has(droppedName), `Generated SQL drops unknown index ${droppedName}.`);
      indexes.delete(droppedName);
      continue;
    }

    assert(!indexes.has(name), `Generated SQL declares duplicate index ${name}.`);
    indexes.set(name, {
      name,
      table,
      unique: Boolean(unique),
      columns: columns.split(",").map(normalizeSqlFragment),
      ...(where === undefined ? {} : { where: normalizeSqlFragment(where) }),
    });
  }

  return indexes;
}

assert(existsSync(resolve(proofRoot, "schema.ts")), "Proof schema is missing.");
assert(existsSync(resolve(proofRoot, "semantic-details.ts")), "Proof validator is missing.");

const sqlFiles = readdirSync(migrationRoot)
  .filter((file) => file.endsWith(".sql"))
  .sort();
assert(sqlFiles.length > 0, "Generated SQL migration is missing.");
const generatedSql = sqlFiles
  .map((file) => readFileSync(resolve(migrationRoot, file), "utf8"))
  .join("\n");
const latestSqlFile = sqlFiles.at(-1);
assert(latestSqlFile, "Latest generated SQL migration is missing.");

assert(count(generatedSql, "CREATE TABLE") === 14, "Expected eight candidate and six fixture tables.");
for (const table of [
  ...expectedResponsibilityTables,
  "p13_fixture_users",
  "p13_fixture_connected_accounts",
  "p13_fixture_conversations",
  "p13_fixture_participant_identities",
  "p13_fixture_messages",
  "p13_fixture_ai_interpretation_runs",
]) {
  assert(generatedSql.includes(`CREATE TABLE "${table}"`), `Generated SQL is missing table ${table}.`);
}

for (const required of [
  '"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid()',
  '"semantic_details" jsonb DEFAULT \'{}\'::jsonb NOT NULL',
  '"accepted_evidence_revision" bigint NOT NULL',
  '"semantic_evidence_revision" bigint DEFAULT 0 NOT NULL',
  '"resolved_date" date',
  'timestamp (3) with time zone',
  'FOREIGN KEY ("connected_account_id","user_id")',
  'FOREIGN KEY ("conversation_id","connected_account_id")',
  'FOREIGN KEY ("actor_participant_id","user_id")',
  'FOREIGN KEY ("interpretation_run_id","user_id")',
  'ON DELETE no action',
]) {
  assert(generatedSql.includes(required), `Generated SQL is missing required DDL: ${required}`);
}

const generatedIndexes = parseGeneratedIndexes(generatedSql);
const expectedIndexNames = new Set(expectedResponsibilityIndexes.map((index) => index.name));
assert(
  generatedIndexes.size === expectedResponsibilityIndexes.length,
  `Expected ${expectedResponsibilityIndexes.length} canonical Responsibility indexes, found ${generatedIndexes.size}.`,
);

for (const name of generatedIndexes.keys()) {
  assert(expectedIndexNames.has(name), `Generated SQL contains unexpected Responsibility index ${name}.`);
}

for (const expectedIndex of expectedResponsibilityIndexes) {
  const generatedIndex = generatedIndexes.get(expectedIndex.name);
  assert(generatedIndex, `Generated SQL is missing index ${expectedIndex.name}.`);
  assert(
    generatedIndex.table === expectedIndex.table,
    `Index ${expectedIndex.name} targets ${generatedIndex.table}, expected ${expectedIndex.table}.`,
  );
  assert(
    generatedIndex.unique === expectedIndex.unique,
    `Index ${expectedIndex.name} uniqueness does not match the canonical DDL.`,
  );
  assert(
    JSON.stringify(generatedIndex.columns) === JSON.stringify(expectedIndex.columns),
    `Index ${expectedIndex.name} key order/directions do not match the canonical DDL: ${generatedIndex.columns.join(", ")}.`,
  );
  assert(
    generatedIndex.where === expectedIndex.where,
    `Index ${expectedIndex.name} predicate does not match the canonical DDL: ${generatedIndex.where ?? "<none>"}.`,
  );
}

for (const constraint of [
  "p13_fixture_connected_accounts_id_user_uq",
  "p13_fixture_conversations_id_account_uq",
  "p13_fixture_participants_id_user_uq",
  "p13_fixture_messages_id_account_uq",
  "p13_fixture_ai_runs_id_user_uq",
  "p13_fixture_conversations_revision_nonnegative",
  "responsibilities_resolution_consistency_check",
  "responsibilities_deferred_state_check",
  "responsibility_temporal_facts_value_shape_check",
  "responsibility_admission_reviews_resolution_shape_check",
  "responsibility_domain_events_version_check",
  "responsibility_provenance_refs_owner_check",
]) {
  assert(generatedSql.includes(`"${constraint}"`), `Generated SQL is missing check ${constraint}.`);
}

assert(
  !generatedSql.includes("SET NULL ("),
  "Generated SQL unexpectedly emits unsupported column-list SET NULL; review the fallback.",
);

console.log(
  JSON.stringify(
    {
      kind: "p13-generated-schema-check-v1",
      status: "PASS",
      migration: `proofs/responsibility-l2/migrations/${latestSqlFile}`,
      migrationChainLength: sqlFiles.length,
      tables: 14,
      candidateTables: expectedResponsibilityTables.length,
      canonicalResponsibilityIndexes: expectedResponsibilityIndexes.length,
      fixtures: 6,
      fallback: "AI-run optional links use NO ACTION plus explicit retention cleanup.",
    },
    null,
    2,
  ),
);
