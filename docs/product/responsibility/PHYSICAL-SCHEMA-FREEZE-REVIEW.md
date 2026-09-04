# Responsibility Physical Schema Freeze Review v0.1

## Status

**L1 PASS — the logical persistence boundary was frozen by this review. The later independent executable audit also earned L2 PASS/FREEZE at DDL v0.4; production migration/runtime remains unauthorized.**

This review is the decision point after:

- Responsibility semantic principles;
- 44/44 fully layered Tier-0 base oracles;
- 20/20 transition traces;
- the first physical-model design;
- three adversarial physical-model audits;
- cross-document consistency reconciliation.

The review asks one narrow question:

> **Has the corpus exposed enough structural pressure to freeze which persistence boundaries exist and which semantics belong relationally vs typed aggregate-local detail, without prematurely freezing exact SQL?**

Answer: **yes**.

---

# 1. Freeze levels

To avoid the word `schema freeze` hiding different decisions, v0.1 uses four levels.

```text
L0 — semantic model
L1 — logical persistence boundary
L2 — exact physical DDL / enum / indexes / JSON schema
L3 — migrations + production implementation
```

L1 result at the time of this review, with the current L2 disposition shown for navigation:

```text
L0 semantic model                         FROZEN v0.1 baseline
L1 logical persistence boundary           FROZEN v0.1 baseline
L2 exact PostgreSQL/Drizzle schema        FROZEN — DDL v0.4
L3 migrations/runtime                     NOT AUTHORIZED by this freeze
```

A stronger canonical/production counterexample may still supersede L0/L1 through an explicit versioned decision.

---

# 2. Frozen L1 boundary

The following logical persistence boundaries are accepted for Responsibility v0.1.

```text
# Accepted Responsibility aggregate
Responsibility
ObligationLeg[]
ExpectedEvent[]
TemporalFact[]
FieldDecision[]
ProvenanceReference[]
DomainEvent[]
SemanticDetails (typed/versioned aggregate-local document)

# Accepted product state before Responsibility admission
AdmissionReview[]

# Separate inference/evidence authorities
Message / Attachment / provider observations
AIInterpretationRun

# Separate operational authorities
TemporalContract / TemporalTrigger
Draft / SendOperation
```

Exact table names are not L1 decisions, but the **boundaries and ownership responsibilities are**.

---

# 3. Frozen parent semantics

`Responsibility` is the communication-bounded operational episode identity.

The parent must preserve orthogonal top-level concerns needed for common reads and invariants, conceptually including:

```text
opaque responsibility identity
user/scope/account/conversation ownership
operational outcome
resolution status/reason
live tracking activation
authoritative attention/defer state
evidence revision
aggregate/concurrency version
created/updated/resolved timing
version of typed semantic details
```

Do not restore:

```text
one lifecycle enum
scalar next_owner as full truth
BOTH
one deadline_at
FOLLOW_UP state
UNCERTAIN lifecycle state
completed boolean as full resolution truth
```

---

# 4. Frozen normalized structures

## 4.1 Obligation legs — NORMALIZED

**Reason:** core cardinality, actionability, parallel/conditional behavior, projection.

Protected by:

```text
T0-003/T0-004
T0-012
T0-020
T0-029
T0-031/T0-032
T0-036
T16/T18
```

Required semantics:

```text
bearer
action/status/actionability
basis/authority when material
condition/activation linkage when needed
history preserved across REOPEN
```

Granularity is not one row per verb.

---

## 4.2 Expected events — NORMALIZED

**Reason:** Waiting projection, reply/document/external conditions, conditional activation.

Protected by:

```text
T0-002/T0-003
T0-005..008
T0-017
T0-034
T02/T04/T07/T09/T18
```

Required semantics include:

```text
actor/event/status
activation linkage when material
accepted evidence authority
optional basis_kind / expectation_strength when material
```

Capability evidence does not automatically become an expected event/time.

---

## 4.3 Material temporal facts — NORMALIZED

**Reason:** multiple coexisting time meanings, sorting, correction/conflict, provenance, event anchors.

Protected by:

```text
T0-001..004
T0-005..008
T0-018
T0-026..028
T19
```

Minimum Responsibility-owned semantic kinds:

```text
SOURCE_DUE
EXPECTED_EVENT_TIME
USER_TARGET
```

`RESURFACE_TIME` / `FOLLOW_UP_TIME` remain semantic distinctions but normally have physical authority in TemporalContract/Trigger unless a demonstrated query requires duplication.

Temporal rows need currentness/conflict semantics that allow unresolved candidates to coexist.

---

## 4.4 Field decisions — NORMALIZED, NARROW

**Reason:** current field-scoped user/authority decisions must be directly queryable and stale-AI safe.

Protected by:

```text
user field correction principle
T0-026 negative boundary
T0-027/T0-028 conflict/correction
T15 stale AI
```

The structure stores accepted authority decisions about supported semantic fields.

It is **not** generic EAV and does not own USER_TARGET merely because a user supplied it.

Trusted implementation must constrain supported field keys.

---

## 4.5 Provenance references — NORMALIZED

**Reason:** decision-critical source traceability, compositional source support, explanation, audit.

Protected by the entire corpus, especially:

```text
T0-022/T0-025 compositional zoning
T0-027/T0-028 correction/conflict
T0-034 claim/observation
T0-037 high-risk request
T19 temporal anchor
M39/R27 provenance requirements
```

The reference must be able to identify:

```text
target field/entity/local semantic item
evidence source/locator
optional support_role when material
```

Do not duplicate full message bodies.

---

## 4.6 Domain events/effects — NORMALIZED APPEND-ONLY HISTORY

**Reason:** explanation, idempotency, composite effects, concurrency, REOPEN/SUPERSEDE history.

Protected by:

```text
T10/T11/T12
T14/T15
V16 duplicate ingestion
```

Required capabilities:

```text
operation/effect
basis evidence revision
resulting aggregate version
source event/idempotency key
correlation ID for one source causing multiple aggregate effects
change summary
```

Normal reads use current state; the event log is not the primary event-sourced read model.

---

# 5. Frozen typed aggregate-local details boundary

The following concepts are semantically required but remain inside a strictly typed/versioned Responsibility-local details document unless later evidence crosses the promotion threshold:

```text
completion criteria
constraints
pending proposals
agreed facts
field-scoped uncertainties
unresolved shared/ANY_OF assignment semantics
target-scoped risk details not naturally owned by a normalized leg/action
```

This boundary is protected by:

```text
T0-009/T0-010/T05/T06 proposal/agreement
T0-014/T07 hold/constraint
T0-033/T17 completion criteria
T0-040 ANY_OF ambiguity
T0-011 preference negative boundary
```

## Promotion threshold out of typed details

Normalize a detail only when demonstrated pressure includes one or more of:

```text
frequent indexed query
independent foreign-key identity
cross-aggregate reference
high-contention partial update
DB-level invariant materially reduces high harm
independent authorization/retention lifecycle
independent scheduling/execution ownership
```

Semantic existence alone is not enough.

---

# 6. Frozen pre-admission product boundary

`AdmissionReview` is accepted as a separate logical product-state aggregate/class.

Protected by:

```text
T0-041
T0-042
T0-043
T0-044
```

It exists only when admission itself remains unresolved and needs durable/surfaced product state.

It is not:

```text
a Responsibility
a copy of every AI candidate
a record for every DO_NOT_TRACK result
a generic review workflow
```

Required semantics:

```text
user/scope/account/conversation ownership
open/resolved review status
reason codes
candidate summary/fields
current evidence revision
source/idempotency linkage
provenance / interpretation linkage
optional created Responsibility link after TRACK resolution
stale-safe user resolution
```

Product `REVIEW` is therefore a union projection across:

```text
admitted Responsibility with material field uncertainty
OR
AdmissionReview before Responsibility existence is decided
```

The internal subject type must remain distinguishable.

---

# 7. Explicitly rejected L1 alternatives

The following are rejected for v0.1 unless new evidence explicitly supersedes this review:

```text
giant Responsibility semantic JSON as sole truth
fully normalized table for every semantic concept
single lifecycle enum
one normalized workflow node per linguistic verb
generic BPMN/workflow graph
team assignment engine
sarcasm/sentiment state machine
recipient/CC ownership table
direction-specific inbound/outbound task tables
generic episode parent above Responsibility
generic relationship/CRM authority engine inside Responsibility
proposal/decision graph
projection bucket as sole canonical state
AIInterpretationRun as durable Review product truth
```

---

# 8. L2 exact-DDL requirements carried forward from the L1 review

Although L1 is frozen, the exact DDL required an independent proof of these constraints. The DDL v0.4 proof and final decision are recorded in §14.

## 8.1 Idempotency

Where stable source identity exists, duplicate delivery must not duplicate semantic effects.

Enforcement must be mechanical, for example via a uniqueness boundary equivalent to:

```text
(responsibility_id, source_event_key, effect_discriminator)
```

or another demonstrably safe design.

AdmissionReview creation/resolution also needs idempotency.

## 8.2 Concurrency

Reducer writes must compare current:

```text
evidence_revision
aggregate_version
```

or provide equivalent transactional safety.

A matching revision is necessary, not sufficient, for AI result application.

## 8.3 Field decision uniqueness

At most one accepted active decision per supported semantic field/Responsibility should exist unless the field explicitly supports a conflict set.

The exact DB/index strategy is fixed by DDL v0.4 and the executable proof.

## 8.4 Temporal conflict support

DDL must permit:

```text
accepted current
conflict candidate(s)
superseded/history
```

without a simplistic unique-current constraint that destroys T0-028.

## 8.5 Stable IDs inside typed details

Array elements referenced by provenance/events need stable local identity across rewrites/migrations.

## 8.6 Runtime validation/version migration

`semantic_details_jsonb` requires:

```text
explicit version
trusted runtime schema validation
versioned migration path
no raw provider payload/model prose/credentials
```

## 8.7 Risk

A parent risk summary, if present, is derived/conservative convenience only. Canonical harm may be leg/field/action/side-effect scoped.

## 8.8 Referential/account safety

DDL/application constraints must preserve:

```text
user/account/conversation ownership
no automatic cross-account Responsibility merge
explicit send/reply account identity
```

---

# 9. Acceptance matrix

| Requirement | L1 representation | Main oracle/trace proof | Freeze result |
| --- | --- | --- | --- |
| USER vs OTHER obligations | ObligationLeg | T0-001..004 | PASS |
| plan/intention/capability distinction | interpretation + ExpectedEvent basis when material | T0-005..008 | PASS |
| proposal != agreement | typed details | T0-009..011, T05/T06 | PASS |
| review != approval | ObligationLeg / expected event + authority | T0-012/T0-013 | PASS |
| hold != cancel/defer | leg actionability + expected event + constraint detail | T0-014/T0-015, T07/T08 | PASS |
| delegation intent != effect | ObligationLeg / expected event | T0-016/T0-017, T09 | PASS |
| courtesy/FYI no task | no Responsibility state | T0-019/T0-024 | PASS |
| direct vs CC assignment | accepted bearer only after interpretation/admission | T0-020/T0-021 | PASS |
| quote/forward zoning | evidence/interpretation + role-aware provenance | T0-022..025 | PASS |
| source due vs user target | TemporalFact | T0-026 | PASS |
| correction/conflict | TemporalFact + uncertainty + provenance/field decision | T0-027/T0-028, T13 | PASS |
| REOPEN history | parent resolution + append new leg + history | T0-029/T10 | PASS |
| new episode | new Responsibility | T0-030/T11 | PASS |
| sequential cohesion | bounded ObligationLeg + local condition | T0-031 | PASS |
| multiple independent outcomes | multiple Responsibilities/effects | T0-032 | PASS |
| partial criteria | typed completion criteria | T0-033/T17 | PASS |
| claim != observation | interpretation/provider evidence + provenance | T0-034/C23 | PASS |
| weak closure | no terminal effect without evidence | T0-035 | PASS |
| parallel obligations | multiple ObligationLeg rows | T0-036/T16 | PASS |
| high-risk safe action | target-scoped risk + accepted safe obligation/action | T0-037 | PASS |
| historical inactive open | parent live-tracking activation | T0-038/T20 | PASS |
| cross-account isolation | parent account boundary | T0-039 | PASS |
| ANY_OF assignment ambiguity | typed details + Review | T0-040 | PASS |
| vague/missing/user-dependent admission | AdmissionReview | T0-041/T0-043/T0-044 | PASS |
| sarcasm/non-literal material ambiguity | AdmissionReview | T0-042 | PASS |
| stale AI | evidence revision + FieldDecision/transaction rules | T15 | PASS at L1 |
| duplicate source application | DomainEvent/idempotency boundary | V16 | PASS at L1; PASS at L2 through the Issue #13 executable proof |
| supersession composite effect | per-aggregate DomainEvent + correlation | T12 | PASS |
| moving event-relative time | TemporalFact anchor/provenance | T19 | PASS |

No row currently requires a structure absent from the frozen L1 boundary.

---

# 10. Why this freeze is justified now

The freeze is not based on “we have designed for long enough.”

It is based on three falsification signals:

### 10.1 Coverage saturation

```text
44 / 44 Tier-0 base cases fully layered
20 / 20 transition traces designed
mandatory contrasts/interactions/mutants/high-harm families mapped
```

### 10.2 Structural saturation

The last sixteen planned schema falsifiers added:

```text
0 new persistence aggregates
0 new lifecycle dimensions
0 generic workflow abstractions
```

They required only refinements inside existing boundaries.

### 10.3 Alternative pressure has been explicitly tested

Both dominant bad extremes were considered and rejected:

```text
Too little structure:
  one lifecycle / scalar owner / giant JSON

Too much structure:
  table/engine for every semantic nuance
```

The accepted hybrid sits at the demonstrated query/invariant boundary rather than the maximal ontology boundary.

---

# 11. What would reopen L1

A later scenario/production failure should reopen this logical boundary only if it demonstrates a materially necessary capability such as:

```text
frequent cross-conversation Responsibility identity that breaks one-conversation ownership
persistent shared-assignment claims/transfers that outgrow AdmissionReview/details
criteria/proposals requiring independent synchronization/authorization/FKs
constraint objects directly authorizing/blocking external tools beyond reducer-local semantics
projection performance impossible without authoritative/rebuildable materialization boundary
new authority state that cannot be represented by FieldDecision/evidence structures
```

Do not reopen L1 because a developer prefers another ORM shape or because another table feels cleaner.

---

# 12. Next engineering step

The correct next artifact is now an **exact DDL design and DDL acceptance review**, not more speculative semantic-table invention.

That step should:

```text
1. choose concrete PostgreSQL/Drizzle table + column names
2. define minimal enums/check constraints
3. define FK/unique/index strategy
4. define typed semantic_details_v1 runtime schema
5. define transaction/idempotency patterns
6. map every DDL element back to this freeze review/oracle
7. independently review the proposed DDL before migration code
```

The L2 review has passed. This does not authorize production migrations; those remain a separate L3 task.

---

# 13. L1 final verdict

```text
Responsibility semantics                 FROZEN v0.1 baseline
Logical persistence boundary             FROZEN v0.1 baseline
Exact PostgreSQL/Drizzle schema          L2 decision deferred to the executable-proof gate below
Migrations/runtime                        NOT AUTHORIZED
```

The v0.1 persistence architecture earned its L1 freeze through scenario/transition falsification rather than by design preference. The exact L2 decision was intentionally left to the independent executable-proof gate, not decided by this original L1 review.

# 14. Final L2 executable-proof decision — DDL v0.4

The original L1 review above and the later L2 decision are separate freeze levels. Following the final index-order correction in Issue #102 / PR #103, Issue #15 independently reviewed the complete cumulative evidence from Issues #13 and #14 and recorded **PASS / FREEZE** for the exact Responsibility PostgreSQL/Drizzle schema at **DDL v0.4**.

Accepted evidence chain:

| Evidence | Accepted result |
| --- | --- |
| [Issue #13](https://github.com/miki-labs/lunowa/issues/13) / [PR #100](https://github.com/miki-labs/lunowa/pull/100), final accepted head `b8ec0e28780e1439eb1152dc80db8933f16969f0`, merge `c91ae14882f4be63fde726d0b7c5f723fb623aa4` | Real PostgreSQL 18.6 P13 proof; acceptance IDs 01–46 and 50–60: 57/57 PASS, including exact Drizzle/generated-SQL, external-FK prerequisite, concurrency/idempotency/privacy/tenant evidence. |
| [Issue #14](https://github.com/miki-labs/lunowa/issues/14) / [PR #99](https://github.com/miki-labs/lunowa/pull/99), final accepted head `5e96f4334b07a7274d03f93a237eb813c35b58a8`, merge `a0fbf2619fa00fac28a141392983a9dd32e59f1a` | Better Auth 1.7.2 UUID/PostgreSQL proof; acceptance IDs 47–49: 3/3 PASS. |
| [Issue #102](https://github.com/miki-labs/lunowa/issues/102) / [PR #103](https://github.com/miki-labs/lunowa/pull/103), final accepted head `4ae650199fb66d9d309a67fcfc7185ec1ca9bff8`, merge `a589179a04f9b2020e9063e2be238b81844ca102` | All seven canonical mixed-order timestamp indexes retain timestamp `DESC`; the deterministic oracle verifies all 27 canonical Responsibility indexes for table, uniqueness, ordered expressions/directions, and predicates. Exact-head `P13 Responsibility L2 PostgreSQL Proof` run `33852869699` PASS on PostgreSQL 18.6; ordinary CI PASS. |
| [Issue #15](https://github.com/miki-labs/lunowa/issues/15) independent audit | Reviewed the cumulative #13 + #14 candidates/evidence, identified the seven lost `DESC` directions as the material exact-DDL blocker, and accepted #102/#103 as resolving it without reopening L0/L1 semantics. |

Pinned proof basis:

```text
PostgreSQL 18.6 (server_version_num=180006)
Better Auth 1.7.2
auth CLI 1.7.2
drizzle-orm 0.45.2
drizzle-kit 0.31.10
pg 8.23.0
```

The resulting levels are:

```text
L0 semantic model                         FROZEN v0.1 baseline
L1 logical persistence boundary           FROZEN v0.1 baseline
L2 exact PostgreSQL/Drizzle schema        FROZEN — DDL v0.4
L3 migrations/runtime                     NOT AUTHORIZED by this freeze
```

The exact table/column/FK/check/unique/index/partial-index/typed-details representation in `POSTGRESQL-DRIZZLE-DDL-DESIGN.md` is now the versioned physical-schema authority for the Responsibility v0.1 implementation basis. This decision does not make P13 proof fixtures production topology: `p13_fixture_*` and the P14 proof-only domain table are evidence scaffolding only. Later production ownership/prerequisite tasks must supply real FK targets and satisfy the proven external-FK/index contracts.

The seven mixed-order indexes remain canonical with timestamp keys `DESC`; PR #103 aligned generated Drizzle SQL with that authority. Drizzle 0.45.2 emits `DESC NULLS LAST` for `.desc()`. Under the accepted constraints this does not change the frozen semantics: six timestamp keys are `NOT NULL`, and `responsibilities_live_done_user_idx` is partial on `resolution_status='RESOLVED'`, whose consistency constraint requires `resolved_at IS NOT NULL`.

Optional `AIInterpretationRun` composite tenant links retain the reviewed fallback of `ON DELETE NO ACTION` plus explicit retention/privacy cleanup. The pinned Drizzle representation does not cleanly emit PostgreSQL column-list `SET NULL` without risking nulling `user_id`; this is an accepted v0.4 implementation reconciliation, not a new semantic decision.

This final L2 decision does not activate Responsibility production migrations, runtime behavior, AI calls, or any other L3 implementation. It does not reopen ADR 0008 or ADR 0009. The durable rationale and provenance are also recorded in [ADR 0010](../../decisions/0010-responsibility-l2-exact-schema-freeze.md).
