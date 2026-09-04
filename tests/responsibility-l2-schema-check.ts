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

assert(existsSync(resolve(proofRoot, "schema.ts")), "Proof schema is missing.");
assert(existsSync(resolve(proofRoot, "semantic-details.ts")), "Proof validator is missing.");

const sqlFile = readdirSync(migrationRoot).find((file) => file.endsWith(".sql"));
assert(sqlFile, "Generated SQL migration is missing.");
const generatedSql = readFileSync(resolve(migrationRoot, sqlFile), "utf8");

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

for (const index of [
  "responsibilities_live_open_user_idx",
  "responsibilities_live_done_user_idx",
  "responsibilities_conversation_idx",
  "responsibilities_account_updated_idx",
  "responsibility_expected_events_pending_idx",
  "responsibility_expected_events_actor_idx",
  "responsibility_obligation_legs_open_projection_idx",
  "responsibility_temporal_current_parent_uq",
  "responsibility_temporal_current_leg_uq",
  "responsibility_temporal_current_event_uq",
  "responsibility_field_decisions_active_uq",
  "responsibility_admission_reviews_open_source_candidate_uq",
  "responsibility_domain_events_application_effect_uq",
  "responsibility_domain_events_mutation_version_uq",
  "responsibility_provenance_refs_message_idx",
]) {
  assert(generatedSql.includes(`"${index}"`), `Generated SQL is missing index ${index}.`);
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
      migration: `proofs/responsibility-l2/migrations/${sqlFile}`,
      tables: 14,
      candidateTables: expectedResponsibilityTables.length,
      fixtures: 6,
      fallback: "AI-run optional links use NO ACTION plus explicit retention cleanup.",
    },
    null,
    2,
  ),
);
