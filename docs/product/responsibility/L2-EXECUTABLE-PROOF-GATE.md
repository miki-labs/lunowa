# Responsibility L2 Executable Proof Gate

## Status

**Accepted execution gate for promoting the Responsibility PostgreSQL / Drizzle schema from static candidate to L2 freeze.**

This document does not freeze L2 and does not authorize migrations.

Current state:

```text
L0 semantic model                         FROZEN v0.1
L1 logical persistence boundary           FROZEN v0.1
L2 exact PostgreSQL/Drizzle candidate      v0.4 STATIC REVIEW COMPLETE
L2 executable proof                        PENDING
L2 final freeze                            BLOCKED
L3 migrations/runtime                      NOT AUTHORIZED
```

The executable proof is split into two independent implementation tasks followed by one independent review task:

```text
Issue #13 — PostgreSQL 18 / Drizzle schema proof
Issue #14 — Better Auth UUID persistence proof
Issue #15 — independent combined review + L2 freeze decision
```

All three tasks use `docs/responsibility-guideline-v0-1` as their semantic/design base until an explicit superseding decision changes that branch.

---

# 1. Why executable proof is required

Three static adversarial audits found multiple defects that were not obvious from the semantic model alone, including:

```text
CREATE idempotency scoped too narrowly
cross-Responsibility child links not mechanically constrained
AdmissionReview delete/check contradiction
same-revision Review resurrection
cross-account Review linkage
cross-user participant/AI-run references
provenance account corruption
CREATE freshness before a Responsibility exists
AI context snapshot/revision race
```

The current v0.4 design has no known static CRITICAL blocker, but that is not sufficient evidence for a persistence freeze.

The next uncertainty is executable:

```text
actual Drizzle SQL emission
actual PostgreSQL 18 FK/index/check behavior
actual delete/cascade behavior
actual concurrent transaction behavior
actual Better Auth UUID schema behavior
```

Therefore prose review is no longer the primary evidence source.

---

# 2. Proof tracks

## Track A — Issue #13

Owns the Responsibility schema and runtime-protocol acceptance IDs:

```text
01–46
50–60
```

excluding:

```text
47–49
```

which belong to Track B.

Track A must use **real PostgreSQL 18** and Drizzle-generated/reviewed SQL.

It is a spike/proof harness, not a production migration.

## Track B — Issue #14

Owns:

```text
47 actual Better Auth user PK is PostgreSQL uuid
48 user/session + supported local account relationship roundtrip works on UUID schema
49 Better Auth/Drizzle schema generation does not silently revert UUID to text
```

Track B must also use real PostgreSQL 18.

Production OAuth/provider credentials are forbidden.

## Track C — Issue #15

Runs only after A and B have concrete evidence.

Track C is independent review, not builder self-approval.

It decides:

```text
PASS -> freeze exact L2 through durable decision/ADR
FAIL -> keep L2 open and issue the smallest corrective task
```

L3 migration work requires a separate later Issue even after L2 passes.

---

# 3. Evidence standard

A test is not `PASS` merely because code exists or a mock returned the expected result.

Every acceptance ID must end in exactly one evidence state:

```text
PASS
FAIL
BLOCKED
NOT_RUN
```

`SKIP` is not an acceptable final L2-freeze state unless Issue #15 explicitly accepts a technically equivalent proof and records why the original test is impossible or redundant.

For every PASS, preserve enough evidence to identify:

```text
acceptance ID
what was exercised
PostgreSQL version
relevant dependency/tool versions
command/test name
expected outcome
observed outcome
relevant constraint/index/transaction path
```

For expected rejection tests, prefer asserting the relevant PostgreSQL SQLSTATE/constraint identity rather than only asserting “some exception occurred.”

Generated SQL is evidence. TypeScript/Drizzle typing is not a substitute for database inspection.

---

# 4. Track A implementation boundary

Track A should create the smallest isolated proof environment capable of testing the accepted contract.

It may add:

```text
Drizzle schema definitions for the spike
minimal upstream fixture tables required by composite ownership FKs
PostgreSQL connection/test helpers
schema generation command
acceptance tests
concurrency/barrier helpers
machine-readable acceptance result output
```

The minimal prerequisite fixtures may include only the keys needed from:

```text
users
connected_accounts
conversations
participant_identities
messages
ai_interpretation_runs
```

Those fixture tables are **not** automatically accepted production DDL.

The proof must clearly distinguish:

```text
Responsibility v0.4 contract under test
vs
minimal test-support prerequisite schema
```

Do not implement production repositories, product routes, provider sync, AI calls, or final migrations.

---

# 5. PostgreSQL environment

The primary proof target is PostgreSQL 18.

Preferred options:

```text
local Docker PostgreSQL 18
or another isolated local PostgreSQL 18 instance
```

Do not substitute:

```text
SQLite
PGlite
an in-memory mock
an older PostgreSQL version
```

for final acceptance.

The harness must record `SELECT version()` or equivalent so the final review can verify the actual server version.

No Neon account or production credential is required for L2 proof.

---

# 6. Drizzle proof requirements

The spike must prove the current Drizzle representation actually emits/permits the PostgreSQL contract.

Inspect at least:

```text
multi-column foreign keys
partial unique indexes
CHECK constraints
column-list or fallback behavior for optional AI-run FK deletion
UUID/default generation
JSONB/timestamptz/date representation
```

When Drizzle cannot express an accepted PostgreSQL construct cleanly:

1. do not silently weaken the invariant;
2. use only the narrow explicit-SQL or `NO ACTION + explicit cleanup` fallback already permitted by v0.4;
3. record the divergence and generated SQL;
4. make Issue #15 review it explicitly.

The proof must not turn a Drizzle API limitation into an application-only data-integrity invariant when PostgreSQL can cheaply enforce it.

---

# 7. Concurrency tests are real concurrency tests

The following cannot be proven by sequential mocks:

```text
31 concurrent duplicate CREATE
34 stale aggregate command protection
35 atomic multi-Responsibility effects
50 stale CREATE after Conversation revision advance
51 stale AdmissionReview after revision advance
52 Conversation admission/matching serialization
53 same-revision duplicate CREATE
57 mixed AI context snapshot/revision race
```

Use multiple database connections/transactions and an explicit barrier/latch so the race window is deterministic.

## 7.1 Duplicate CREATE

Two workers must be able to generate different candidate Responsibility UUIDs for the same semantic application and still produce:

```text
exactly one committed Responsibility/effect
```

The loser must roll back rather than leave an orphan Responsibility.

## 7.2 Conversation freshness

The test must show that `basis_evidence_revision = N` cannot create/update accepted state after the Conversation advances to `N+1`.

## 7.3 Context snapshot

The proof must show that a run labelled revision `N` cannot accidentally contain a mixed context whose membership includes evidence from `N+1`.

Do not hold a simulated remote-model call open under a database row lock. The lock/snapshot protects context capture only.

---

# 8. Delete and privacy tests

Tests 39–42 are not ordinary cascade smoke tests.

They must prove the real FK graph does not create hidden contradictions, particularly around:

```text
cross-child NO ACTION relations
AdmissionReview -> admitted Responsibility RESTRICT
Provenance -> Message RESTRICT
aggregate-local CASCADE
optional AIInterpretationRun retention cleanup
```

If direct parent deletion does not work because of correct cross-child constraints, an explicit deterministic teardown order is acceptable only if it preserves the normal-operation integrity guarantees and is recorded as the accepted L2 behavior.

Do not weaken normal FKs just to make teardown one statement shorter.

---

# 9. Semantic-details proof

Tests 43–46 require **runtime** validation, not only `$type<...>()`.

The spike may use an isolated mature validator or a narrow spike-only validator.

Whichever is chosen:

```text
it is not automatically the production validation-library decision
```

The tests must prove at least:

```text
unknown/wrong version rejected
malformed document rejected
duplicate local IDs rejected
unresolved ANY_OF does not fabricate required legs
proposal does not become agreed fact without reducer evidence/effect
```

---

# 10. Better Auth proof boundary

Track B must verify the database reality, not TypeScript intent.

Required evidence includes:

```text
actual user column SQL type
actual generated schema/migration SQL
successful local user/session behavior
successful domain FK to auth-user UUID
account relation/linking evidence as far as supported without external credentials
```

If literal social-provider account linking requires real OAuth credentials, do not fake the test. Record the unverified portion and let Issue #15 decide whether an equivalent local account-row/linking proof is sufficient for L2 ID compatibility.

If Better Auth does not reliably preserve UUID under the required current configuration, L2 must reopen the cross-system ID-type decision before migration.

---

# 11. Machine-readable result artifact

Track A and B should produce a small result artifact suitable for independent review.

Minimum conceptual shape:

```json
{
  "postgresVersion": "...",
  "toolVersions": { "...": "..." },
  "generatedSchemaEvidence": "...",
  "acceptance": {
    "01": { "status": "PASS", "test": "...", "evidence": "..." }
  }
}
```

The exact filename/format is implementation-open.

Do not store secrets, full connection URLs, provider credentials, or sensitive mailbox data.

---

# 12. L2 final freeze gate

Issue #15 may freeze L2 only when all of the following are true:

```text
1. all acceptance IDs 01–60 are accounted for;
2. no unresolved CRITICAL/HIGH schema-integrity finding remains;
3. PostgreSQL 18 execution is directly evidenced;
4. Drizzle generated SQL was inspected;
5. Better Auth UUID prerequisite is proven or the schema was consistently revised and re-proven;
6. concurrency tests use real competing transactions/connections;
7. tenant/account cross-reference rejection is proven;
8. idempotent CREATE is proven under concurrent different generated UUIDs;
9. deletion/privacy behavior is proven against the real FK graph;
10. any correction discovered during execution is reflected in the canonical DDL design and affected tests rerun;
11. an independent reviewer examines evidence rather than accepting builder summary alone;
12. L3 production migration/runtime work remains a separate task.
```

If v0.4 must change during proof, call the corrected design v0.5+ and rerun all acceptance IDs affected by the change. Static audit history remains preserved.

---

# 13. Failure interpretation

A failing executable test is valuable evidence.

Do not patch the test to fit the DDL before classifying the failure.

Classify failures as one of:

```text
DDL defect
Drizzle representation defect
runtime protocol defect
test-harness defect
platform/version incompatibility
L1 semantic/persistence-boundary falsifier
```

Only the last category reopens L1 automatically.

Most failures should be repaired inside L2 without inventing new semantic tables/states.

---

# 14. Current task routing

Use:

- `https://github.com/miki-thecat/lunowa/issues/13` for PostgreSQL/Drizzle executable proof;
- `https://github.com/miki-thecat/lunowa/issues/14` for Better Auth UUID proof;
- `https://github.com/miki-thecat/lunowa/issues/15` only after both builders produce concrete evidence.

Codex handoffs should stay short. The Issues and repository docs carry task-specific/durable context.