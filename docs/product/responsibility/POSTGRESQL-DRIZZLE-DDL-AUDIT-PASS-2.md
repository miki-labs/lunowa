# Responsibility PostgreSQL / Drizzle DDL Audit — Pass 2

## Status

**v0.2 static audit: ONE NEW CRITICAL BLOCKER FOUND. L2 remains blocked until the pre-Responsibility evidence-revision boundary is corrected.**

Pass 1 found relational/idempotency/account defects in the initial exact DDL. v0.2 fixes those defects. Pass 2 attacks a different question:

> Can a stale semantic interpretation create a brand-new Responsibility when no Responsibility row exists yet to carry/lock `evidence_revision`?

Answer for v0.2: **yes; the protocol is incomplete.**

---

# 1. A13 — stale CREATE has no authoritative pre-Responsibility revision check

**Severity:** CRITICAL
**Protected by:** stale-AI invariant, T15, T0-043 missing-context revision, admission/matching correctness

v0.2 has:

```text
Responsibility.accepted/current evidence revision
AdmissionReview evidence revision
AIInterpretationRun basis revision
```

but a direct determinate `TRACK -> CREATE` path can occur **before either Responsibility or AdmissionReview exists**.

Counterexample:

```text
Conversation semantic evidence revision = 17
AI/interpretation starts on rev17

new message / relevant attachment / authorized semantic context arrives
Conversation semantic evidence revision becomes 18

rev17 result returns:
  TRACK + CREATE R1
```

The CREATE protocol has no existing Responsibility row to lock and therefore cannot prove that rev17 is still the current authorized evidence set. Global `(application_key,effect_key)` uniqueness prevents duplicate application of the *same* semantic application, but it does not prove that the application basis is current.

This is a different invariant:

```text
idempotency != freshness
```

---

# 2. Why global idempotency does not solve A13

Suppose rev18 would have changed the outcome to:

```text
DO_NOT_TRACK
or
match/update existing Responsibility instead of CREATE
```

A stale rev17 application key is still globally unique and can therefore commit an incorrect CREATE unless current evidence authority is checked elsewhere.

Likewise two different semantic source events in one thread can race:

```text
m1 -> looks like CREATE R
m2 -> immediately clarifies/cancels/changes identity
```

Without a conversation-level coordination/revision boundary, concurrently processed events can observe incompatible pre-admission state.

---

# 3. Required correction — Conversation is a concurrency/evidence coordinator, not workflow state owner

v0.1 already constrains one Responsibility to one ConnectedAccount and normally one Conversation.

Use the Conversation row as a narrow **semantic evidence revision + reducer coordination boundary**.

Add conceptually:

```text
Conversation.semantic_evidence_revision bigint NOT NULL
```

The value is a monotonic revision of the authorized semantic evidence/context for that Conversation.

It changes when the input set relevant to communication/Responsibility interpretation changes, such as:

```text
new normalized message
material message-content correction/reconciliation
relevant attachment/attachment-metadata change
provider observation that changes semantic evidence
accepted authorized external context used by the Responsibility reducer
```

It MUST NOT change for cosmetic/UI-only events such as:

```text
open/read rendering
pane selection
local scroll
pure display cache rebuild
```

Exact increment batching is implementation policy; monotonic freshness is the invariant.

---

# 4. Required CREATE/admission transaction order

For semantic admission/matching/reduction in v0.1:

```text
BEGIN
1. SELECT Conversation FOR UPDATE
2. read current semantic_evidence_revision
3. compare candidate/AI basis revision
4. reject stale basis before Responsibility/AdmissionReview creation
5. perform admission + identity matching against current accepted state in this Conversation
6. lock existing Responsibility rows in deterministic order when they will mutate
7. apply effects / global application idempotency
8. COMMIT
```

For duplicate CREATE the global DomainEvent uniqueness remains required; conversation locking is **not** a replacement for idempotency.

For stale AI, conversation revision checking is **not** a replacement for field authority/risk/source validation.

The boundaries are complementary:

```text
Conversation semantic revision -> freshness before/around admission + matching
application/effect key          -> duplicate semantic application
Responsibility aggregate_version -> concurrent accepted-state mutation
Responsibility accepted revision -> last semantic evidence revision applied to that aggregate
FieldDecision                    -> current field authority
```

---

# 5. Responsibility column semantic refinement

The parent column should be named/defined as something like:

```text
accepted_evidence_revision
```

rather than an ambiguous `evidence_revision`.

Meaning:

> the Conversation semantic evidence revision that was last accepted/applied to this Responsibility state.

It is **not necessarily equal** to the current Conversation revision at every instant; unrelated/new evidence may increment the Conversation revision before this particular Responsibility is re-evaluated.

Therefore stale-run eligibility checks use the authoritative current Conversation revision for the interpretation basis, not merely equality to the Responsibility's last-applied revision.

---

# 6. AdmissionReview revision semantic refinement

Likewise AdmissionReview should persist:

```text
basis_evidence_revision
```

and be re-evaluated/resolved while holding/checking the Conversation's current semantic revision.

A Review can remain OPEN while its candidate summary is refreshed to a newer basis revision. A stale run cannot rewrite it back to an older basis.

The all-status uniqueness boundary becomes:

```text
(account, source_event_key, candidate_key, basis_evidence_revision)
```

---

# 7. Does this reopen L1?

**No new Responsibility persistence aggregate is required.**

The missing state belongs to the existing broader `Conversation` evidence/domain boundary, not inside Responsibility or a new workflow table.

This is consistent with:

```text
Conversation is NOT the workflow unit
```

because locking/versioning a Conversation for evidence ordering does not make it the owner of Responsibility lifecycle/state.

It is analogous to using a document/thread row as a serialization/version boundary while child aggregates retain their own domain identity.

---

# 8. Required new acceptance tests

Add at least:

```text
50. stale rev N direct TRACK/CREATE is rejected after Conversation moves to rev N+1
51. stale rev N AdmissionReview creation/update is rejected after rev N+1
52. two semantically related messages processed concurrently serialize admission/matching through Conversation lock
53. duplicate same-revision CREATE is still rejected by global application/effect idempotency
54. Conversation UI/read-state changes do not advance semantic_evidence_revision
55. relevant new message/attachment/provider semantic evidence does advance semantic_evidence_revision
56. Responsibility accepted_evidence_revision records last applied basis without pretending it is current Conversation revision
```

---

# 9. Pass-2 verdict

```text
Pass-1 corrections                       SATISFACTORY in v0.2 design
L1 boundary                              STILL VALID
New L1 table/aggregate                   NOT REQUIRED
Conversation evidence revision           REQUIRED
Conversation reducer coordination lock   REQUIRED for v0.1 admission/matching path
v0.2 L2 candidate                        FAIL until corrected
Migrations                               NOT AUTHORIZED
```

After applying A13, run one final static DDL audit. Then the concrete schema still must be instantiated on PostgreSQL 18 and pass the executable acceptance matrix before L2 freeze.
