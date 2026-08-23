# Responsibility PostgreSQL / Drizzle DDL Audit v0.1

## Status

**INITIAL CANDIDATE FAILS AS WRITTEN; L2 IS BLOCKED UNTIL THE REQUIRED CORRECTIONS IN THIS AUDIT ARE APPLIED AND RE-CHECKED.**

This is an independent adversarial review of `POSTGRESQL-DRIZZLE-DDL-DESIGN.md` against:

- the frozen L0 Responsibility semantics;
- the frozen L1 persistence boundary;
- all 44 Tier-0 detailed oracles;
- all 20 transition traces;
- high-harm account, stale-AI, duplicate-delivery, conflict, and REOPEN cases;
- current PostgreSQL 18 / Drizzle capabilities.

The question is not whether the DDL is plausible. The question is whether a malformed/stale/concurrent write can violate a high-value invariant **even though PostgreSQL could cheaply prevent it**, or whether a valid oracle is rejected by an over-strong constraint.

---

# 1. Audit summary

The L1 hybrid boundary survives. No new semantic aggregate/table is required.

The initial L2 candidate has several concrete defects:

```text
A01 CRITICAL  CREATE idempotency is scoped too narrowly to a generated Responsibility ID
A02 CRITICAL  child cross-links do not mechanically guarantee same-Responsibility ownership
A03 CRITICAL  AdmissionReview ON DELETE SET NULL conflicts with its TRACK resolution CHECK
A04 HIGH      resolved AdmissionReview can be recreated by stale same-revision inference
A05 HIGH      AdmissionReview TRACK link can point to a Responsibility from another account
A06 HIGH      ExpectedEvent closure has no generic closed_at timestamp
A07 HIGH      participant references can cross user ownership if trusted code mis-associates IDs
A08 HIGH      provenance can cite a Message from another connected account without DB rejection
A09 MEDIUM    TemporalFact superseded_at constraint is one-way and permits inconsistent current rows
A10 MEDIUM    source/application keys are too loosely specified for unique B-tree/idempotency use
A11 MEDIUM    AdmissionReview/user-resolution concurrency protocol is underspecified
A12 MEDIUM    updated_at behavior is application-owned but not explicitly frozen
```

Findings A01–A08 are required corrections before L2 freeze.

---

# 2. A01 — CREATE idempotency must not depend on `responsibility_id`

**Severity:** CRITICAL  
**Protected by:** V16, T12, duplicate provider/job delivery, retry after timeout

Initial uniqueness:

```sql
UNIQUE (responsibility_id, application_key, effect_key)
```

works for repeated mutation of an already-known Responsibility, but fails for concurrent duplicate `CREATE` attempts:

```text
worker A -> generates R1 -> CREATE
worker B -> generates R2 -> CREATE
same source/evidence/application
```

Because `responsibility_id` differs, both rows satisfy the initial unique index and two Responsibilities can be committed.

## Required correction

`application_key + effect_key` must identify the semantic effect **before** the target Responsibility ID is accepted.

Use global uniqueness:

```sql
UNIQUE (application_key, effect_key)
```

where:

```text
application_key
  = deterministic trusted semantic-application identity
    scoped by user/account/source/evidence revision/application namespace

effect_key
  = deterministic semantic effect slot inside that application
    and MUST NOT be derived from a newly generated Responsibility UUID
```

Examples:

```text
application_key = hash(account + normalized_source_event + evidence_revision + application_namespace)
effect_key      = "create:candidate-2"
```

A reducer/version change over the same accepted evidence does not automatically justify a new application key. Explicit migration/re-analysis commands use their own versioned application namespace.

## CREATE transaction implication

For a new Responsibility there is no existing row to lock. The transaction may optimistically insert R + children + DomainEvent; the global unique DomainEvent insert is the commit arbiter. A concurrent duplicate loses the unique race and its whole transaction rolls back. The caller can then load the already-accepted event/Responsibility.

---

# 3. A02 — Same-parent child relations belong in PostgreSQL

**Severity:** CRITICAL  
**Protected by:** T18 conditional activation, T0-026 temporal targeting, T0-036 parallel legs

The initial candidate leaves these as reducer-only checks:

```text
ObligationLeg.activation_event_id belongs to the same Responsibility
TemporalFact.obligation_leg_id belongs to the same Responsibility
TemporalFact.expected_event_id belongs to the same Responsibility
```

A wrong cross-aggregate reference can activate/block/sort the wrong Responsibility and is cheap to prevent relationally.

PostgreSQL supports multi-column FKs, but the referenced column set must be backed by a primary/unique constraint or non-partial unique index.

## Required correction

Add redundant but intentional unique keys:

```sql
responsibility_expected_events UNIQUE (id, responsibility_id)
responsibility_obligation_legs UNIQUE (id, responsibility_id)
```

Then use:

```sql
FOREIGN KEY (activation_event_id, responsibility_id)
  REFERENCES responsibility_expected_events (id, responsibility_id)

FOREIGN KEY (obligation_leg_id, responsibility_id)
  REFERENCES responsibility_obligation_legs (id, responsibility_id)

FOREIGN KEY (expected_event_id, responsibility_id)
  REFERENCES responsibility_expected_events (id, responsibility_id)
```

This is narrow relational integrity, not workflow-engine complexity.

Cross-child delete actions should be `NO ACTION`/equivalent rather than deleting history as a side effect of deleting one child. Direct child hard-delete is not a normal domain transition; normal lifecycle changes close/supersede rows.

Parent aggregate deletion may still cascade aggregate-local rows and must be integration-tested with the chosen FK actions.

---

# 4. A03 — AdmissionReview `SET NULL` contradicts TRACK resolution

**Severity:** CRITICAL

Initial design:

```text
TRACK resolution -> admitted_responsibility_id MUST NOT be null
FK on admitted_responsibility_id -> ON DELETE SET NULL
```

Deleting the admitted Responsibility would attempt to set the FK to null and immediately violate the same Review row's CHECK constraint.

## Required correction

Use:

```text
ON DELETE RESTRICT / NO ACTION
```

for the admitted Responsibility link.

Hard deletion is not a normal Responsibility lifecycle operation; normal user stop-tracking is `USER_CLOSED`. Privacy/account deletion should delete dependent historical Review state explicitly/in the correct order.

Do not weaken the TRACK-resolution invariant merely to make hard delete convenient.

---

# 5. A04 — Stale same-revision AdmissionReview resurrection

**Severity:** HIGH  
**Protected by:** T0-041..044, stale AI principle

Initial partial unique index prevents two **simultaneously OPEN** rows but allows:

```text
Review rev17 -> USER resolves DO_NOT_TRACK
stale rev17 model worker arrives later
-> creates another OPEN row because the old row is now RESOLVED
```

## Required correction

Use two uniqueness layers:

```sql
UNIQUE (
  connected_account_id,
  source_event_key,
  candidate_key,
  evidence_revision
)
```

across all statuses, plus the existing partial uniqueness:

```text
at most one OPEN review for source_event_key + candidate_key
```

This allows a genuinely new evidence revision to generate a new review episode while preventing re-creation from the exact same accepted evidence set.

`candidate_key` must be a deterministic trusted semantic-candidate identity, not a model-run ID or unstable generated label.

---

# 6. A05 — TRACKed review must link to same-account Responsibility

**Severity:** HIGH  
**Protected by:** T0-039, H06/H13

A UUID FK alone proves that the Responsibility exists, not that it belongs to the Review's account.

## Required correction

Expose:

```sql
responsibilities UNIQUE (id, connected_account_id)
```

and make the Review link composite:

```sql
FOREIGN KEY (admitted_responsibility_id, connected_account_id)
  REFERENCES responsibilities (id, connected_account_id)
  ON DELETE RESTRICT
```

This prevents a bad trusted-code write from resolving an Outlook review by linking it to an unrelated Gmail Responsibility.

---

# 7. A06 — ExpectedEvent needs `closed_at`

**Severity:** HIGH

`ExpectedEvent` can close as:

```text
SATISFIED
CANCELLED
INVALIDATED
SUPERSEDED
```

The initial design has only `satisfied_at`, so a non-satisfaction closure has no generic closure timestamp.

## Required correction

Add:

```text
closed_at timestamptz(3)
```

with invariant:

```text
PENDING -> closure_reason, closed_at, satisfied_at all null
CLOSED  -> closure_reason + closed_at required
satisfied_at may be populated only for a satisfaction closure
```

`satisfied_at` remains optional even for satisfaction when the exact external occurrence time is unknown; `closed_at` records when Lunowa accepted closure.

---

# 8. A07 — Participant references need tenant ownership integrity

**Severity:** HIGH

The conceptual `ParticipantIdentity` belongs to a Lunowa User. A bare participant UUID FK on an obligation/event permits a cross-user participant association if trusted code passes the wrong UUID.

## Required correction

For `responsibility_obligation_legs` and `responsibility_expected_events`, duplicate `user_id` intentionally and enforce:

```text
(responsibility_id, user_id)
  -> responsibilities(id, user_id)

(participant_id, user_id)
  -> participant_identities(id, user_id)
```

This requires unique keys:

```text
responsibilities UNIQUE(id, user_id)
participant_identities UNIQUE(id, user_id)
```

The duplication is justified as a tenant-integrity boundary; it is not an independent source of ownership truth.

---

# 9. A08 — Provenance message/account integrity should be mechanical

**Severity:** HIGH  
**Protected by:** T0-022..025, T0-039, provenance trust requirements

The initial provenance row can associate a Gmail Responsibility with a Message UUID from another account if application code is wrong.

In v0.1, cross-account Responsibility evidence is intentionally prohibited.

## Required correction

Add `connected_account_id` to provenance and expose composite unique keys:

```text
responsibilities                 UNIQUE(id, connected_account_id)
responsibility_admission_reviews UNIQUE(id, connected_account_id)
messages                         UNIQUE(id, connected_account_id)
```

Then provenance uses composite owner/message FKs so all cited Message evidence shares the owner's account.

If a future v0.2 explicitly allows cross-account Responsibility evidence, this constraint must be revisited through a semantic/ADR change rather than bypassed ad hoc.

For `domain_event_id`, require a Responsibility owner and a same-Responsibility composite FK when present.

---

# 10. A09 — Temporal supersession timestamp consistency

**Severity:** MEDIUM

Initial check only states:

```text
SUPERSEDED -> superseded_at IS NOT NULL
```

but permits:

```text
ACCEPTED_CURRENT + superseded_at != NULL
```

## Required correction

Use equivalence:

```text
currentness_status = SUPERSEDED
<=>
superseded_at IS NOT NULL
```

`HISTORICAL` and `CONFLICT_CANDIDATE` remain non-superseded states with `superseded_at = NULL`.

`HISTORICAL` is retained because it can represent retained evidence/history that was not necessarily the once-accepted value that a later value superseded.

---

# 11. A10 — Idempotency keys must be bounded canonical machine keys

**Severity:** MEDIUM

The initial 512-character bounds permit arbitrary long text inside unique B-tree keys and leave canonicalization vague.

## Required correction

Define:

```text
source_event_key  = trusted normalized opaque key, max 256 ASCII chars
application_key   = trusted deterministic opaque key/hash, max 128 ASCII chars
candidate_key     = trusted deterministic candidate identity, max 128 ASCII chars
effect_key        = trusted deterministic semantic effect slot, max 128 ASCII chars
```

Do not put raw URLs, message bodies, model prose, or user strings in these keys.

Key generation is versioned trusted code and gets direct unit tests.

---

# 12. A11 — AdmissionReview resolution needs its own transaction protocol

**Severity:** MEDIUM/HIGH

The table has `aggregate_version`, but the initial transaction section describes only Responsibility mutation.

## Required correction

Resolving a Review must:

```text
BEGIN
SELECT AdmissionReview FOR UPDATE
verify expected aggregate_version + current evidence_revision
if already RESOLVED -> return the stored resolution idempotently
if TRACK:
  atomically create/load the accepted Responsibility through the CREATE idempotency boundary
  set resolution=TRACK + admitted_responsibility_id
if DO_NOT_TRACK:
  set resolution=DO_NOT_TRACK
increment Review aggregate_version
COMMIT
```

A stale model run may re-evaluate an OPEN row only against the current evidence revision and must not reverse a user-resolved row.

A separate resolution idempotency table is not required yet; row lock + terminal Review state + CREATE global idempotency is sufficient.

---

# 13. A12 — `updated_at` ownership must be explicit

**Severity:** MEDIUM

The DDL has `DEFAULT now()` but no trigger, so updates do not automatically change `updated_at`.

This is acceptable and preferable to hidden triggers, but it must be explicit:

```text
trusted repository/reducer writes set updated_at = now()
```

Drizzle/runtime convenience hooks are not the database invariant. Tests must verify reducer writes update timestamps where product ordering/debugging relies on them.

---

# 14. Delete/retention policy findings

## 14.1 Aggregate-local rows

`ON DELETE CASCADE` from the Responsibility parent to its local rows is acceptable for explicit hard-delete/privacy teardown.

Normal domain transitions never hard-delete legs/events/history; they close/supersede them.

## 14.2 Cross-child references

Use `NO ACTION`/equivalent for event/leg target references so deleting one child cannot silently erase another child's semantic history.

The temporary PostgreSQL acceptance suite must prove that parent aggregate hard-delete still succeeds with all aggregate-local rows removed by the same operation; if the concrete FK timing blocks this, use an explicit deterministic teardown order rather than weakening normal referential safety.

## 14.3 Message evidence

`Provenance -> Message ON DELETE RESTRICT` is acceptable only with an explicit privacy deletion order:

```text
remove Responsibility/Review state + provenance
then remove Message/provider evidence
```

Do not retain short excerpts after the source Message is privacy-deleted unless retention policy explicitly authorizes it.

`source_excerpt_short` should be optional and omitted by default unless it materially improves explanation robustness; the locator/source ID is preferred.

---

# 15. Constraints that survive audit

The following initial choices survive unchanged:

```text
text + DB CHECK instead of native PostgreSQL ENUM for evolving control state
uuid domain IDs, contingent on Better Auth UUID spike before migration
DATE vs INSTANT vs UNRESOLVED temporal value shape
three partial accepted-current TemporalFact unique indexes
one ACTIVE FieldDecision per supported field
orthogonal parent state; no lifecycle/next_owner/deadline shortcut
no GIN index on semantic details yet
no projection cache yet
READ COMMITTED + explicit row locks/version checks as default aggregate protocol
SERIALIZABLE only when a future cross-aggregate invariant demonstrates need
runtime-versioned semantic details
no generic workflow/assignment/proposal/sarcasm tables
```

PostgreSQL 18 supports multi-column FKs, unique constraints, and partial unique indexes needed by the corrections. Drizzle exposes multi-column foreign keys, checks, indexes, partial-index predicates, and transactions; exact generated SQL remains reviewable.

---

# 16. Better Auth UUID gate

The UUID strategy is accepted **conditionally**.

Current Better Auth documentation exposes `advanced.database.generateId = "uuid"`; for PostgreSQL it can generate/use UUID-typed IDs. The exact project integration must still be verified before L2 becomes migration authority.

Required spike result:

```text
actual Better Auth user table ID type = PostgreSQL uuid
Drizzle relation to domain user_id works without string-type mismatch
sign-up/session/account-linking roundtrip passes
Better Auth CLI/schema generation does not silently revert IDs to text
```

If this fails, reopen only the cross-system ID type decision; do not weaken the frozen Responsibility L0/L1 model.

---

# 17. Revised L2 acceptance tests

In addition to the original 20 tests, the corrected schema must prove:

```text
21. duplicate concurrent CREATE with different generated Responsibility UUIDs -> exactly one commits
22. activation_event_id from another Responsibility -> FK rejection
23. TemporalFact leg/event target from another Responsibility -> FK rejection
24. TRACKed AdmissionReview linked to a Responsibility in another account -> FK rejection
25. deleting admitted Responsibility while TRACK Review exists -> rejected rather than CHECK corruption
26. resolved Review at rev N cannot be recreated for same source/candidate/rev N
27. new rev N+1 may create/re-evaluate according to product rules
28. ExpectedEvent CLOSED has closed_at; non-satisfaction closure does not require fake satisfied_at
29. participant from another Lunowa user -> FK rejection
30. provenance Message from another connected account -> FK rejection
31. ACCEPTED_CURRENT TemporalFact with superseded_at -> rejected
32. global duplicate (application_key,effect_key) across two newly generated Responsibilities -> rejected
33. Review resolution retry returns same terminal result and does not create a second Responsibility
34. aggregate hard-delete behavior is verified with composite/cross-child FKs
35. privacy deletion order removes provenance before Message evidence
```

---

# 18. Audit verdict

The initial exact DDL is **not accepted as L2**.

The failure is constructive:

```text
L0 semantics                         PASS
L1 logical boundary                 PASS
L2 initial exact DDL                FAIL
New L1 aggregate/table needed       NO
Required L2 corrections             YES
Migrations authorized               NO
```

The correct next action is to revise the exact DDL **within the already-frozen L1 boundary**, then re-run this audit matrix. Only a corrected self-contained DDL that passes may be promoted to an L2 freeze/ADR.