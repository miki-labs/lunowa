# Responsibility Physical Model Adversarial Audit v0.1

## Status

**Accepted audit of `PHYSICAL-MODEL-DESIGN.md`; the physical model itself remains NOT FROZEN.**

This audit intentionally tries to break the current hybrid persistence candidate before any Drizzle schema or migration is written.

The question is not whether the candidate is elegant. The question is whether it can preserve the fixed Responsibility semantics under the highest-harm scenarios with less complexity than the alternatives.

---

# 1. Audit conclusion

Current result:

```text
Hybrid parent + normalized legs/events/times       KEEP
Typed/versioned low-query semantic details         KEEP with stronger constraints
User field authority only in event history         REJECT as preferred design
Single parent risk scalar as canonical truth       REJECT
Explicit idempotency/source-application key         REQUIRED
Stable IDs inside semantic-details arrays           REQUIRED
Generic workflow graph / assignment engine          REJECT
Projection cache at schema v1                       DEFER
Cross-thread Responsibility persistence             DEFER / explicit scope limit
```

The candidate survives the audit, but only with three material refinements:

1. current field-scoped user authority should be directly queryable, not reconstructed from event history on every reducer decision;
2. risk must remain field/action-scoped where necessary rather than becoming one complete parent truth;
3. idempotent evidence application needs a mechanical persistence boundary.

These are not cosmetic changes. They prevent stale-AI overwrite, high-risk action flattening, and duplicate state mutation.

---

# 2. PMA-01 — Current field authority must be directly queryable

**Severity:** CRITICAL
**Finding:** the first candidate preferred append-only domain events alone for user field decisions. That is too weak as the normal authorization/reducer lookup path.

Fixed semantic requirement:

```text
user correction is field-scoped
stale AI must not overwrite it
new evidence changes it only under explicit rules
```

If the reducer must scan/reconstruct arbitrary event history to learn whether `source_due`, `owner`, or another field currently has USER authority, the most important override invariant becomes application-convention fragile.

## Revised preferred physical concept

Use a narrow current-decision table plus append-only history:

```text
ResponsibilityFieldDecision {
  id
  responsibility_id
  field_key

  value_jsonb
  authority_kind            // USER initially; future kinds only with evidence
  basis_evidence_revision

  status                    // ACTIVE | SUPERSEDED
  created_at
  superseded_at?
}
```

Candidate invariant:

```text
at most one ACTIVE decision per (responsibility_id, field_key)
```

The domain-event log still records how/why the decision changed.

### Why this is not generic EAV state

The table stores **explicit authority decisions**, not the entire Responsibility model. Canonical state remains in typed parent/child/details structures.

### Falsifier

If implementation shows all user corrections can be represented by a tiny set of dedicated typed columns without duplication, prefer those columns. Do not keep a generic table merely because this document suggested one.

---

# 3. PMA-02 — Risk cannot become one complete parent scalar

**Severity:** HIGH
**Finding:** `PHYSICAL-MODEL-DESIGN.md` listed `risk_class?` on the parent. That is acceptable only as a derived/aggregate summary, not as complete canonical truth.

Counterexample:

```text
Responsibility contains:
- low-risk read/review leg
- high-risk signature/payment/commitment leg
```

or:

```text
communicated requested action = TRANSFER_MONEY
safe next action = VERIFY_REQUEST
```

The harm of acting on one field/action is not necessarily the harm of every fact in the Responsibility.

## Revised rule

Canonical risk may live at the smallest material semantic target:

```text
obligation leg
safe-action decision
field uncertainty
specific external side effect
```

An optional parent:

```text
aggregate_risk
```

may be derived/cached for list ordering or conservative policy, but must not erase target-specific risk/provenance.

---

# 4. PMA-03 — Evidence application must be idempotent mechanically

**Severity:** CRITICAL
**Finding:** `evidence_revision + aggregate_version` protects stale/concurrent writes but does not alone prevent the same normalized source event from being applied twice.

Canonical hazards:

```text
duplicate provider notification
duplicate message ingestion
worker retry
replayed reconciliation job
same temporal trigger delivered twice
```

## Revised physical requirement

Each accepted evidence application needs a stable application key or equivalent uniqueness boundary.

Conceptually:

```text
ResponsibilityDomainEvent {
  ...
  source_event_key?
  idempotency_key?
}
```

or a dedicated applied-event table.

Mechanical invariant where a stable key exists:

```text
UNIQUE(responsibility_id, source_event_key, effect_discriminator)
```

Exact shape depends on event taxonomy. The important requirement is that duplicate delivery cannot produce duplicate semantic effects merely because application code forgot to check.

For one focal event producing effects on two Responsibilities, each aggregate receives its own effect record while the application command/correlation ID ties them together.

---

# 5. PMA-04 — Activation semantics need a precise meaning before enum freeze

**Severity:** HIGH
**Finding:** phrases such as `live_tracking_state`, `activation_status`, and “active work” can still be misread.

Required distinction from T20:

```text
resolution_status = OPEN
but historical evidence is not enrolled as current live work
```

Required distinction from Done:

```text
recent current episode may be RESOLVED and still appear in Done/history
```

Therefore “ACTIVE” must not mean “OPEN”.

## Required semantic definition before implementation

The physical activation dimension should mean approximately:

> **whether this Responsibility episode is enrolled in the user's current Lunowa tracking/projection set rather than retained only as an inactive historical candidate.**

Exact name remains open. Candidate values can be tested as:

```text
TRACKING_ACTIVE
HISTORICAL_INACTIVE
```

but should not be frozen until detailed historical/user-close oracles are complete.

---

# 6. PMA-05 — `semantic_details_jsonb` needs hard boundaries

**Severity:** HIGH
**Finding:** one typed details document is viable only if it does not become a dumping ground for every difficult field.

Allowed current contents are limited to demonstrated low-global-query structures:

```text
completion_criteria[]
constraints[]
pending_proposals[]
agreed_facts[]
uncertainties[]
assignment_semantics?
risk assessments that do not belong naturally to a normalized leg
```

## Required controls

- explicit `semantic_details_version`;
- runtime schema validation on every trusted write;
- stable local IDs for array elements when provenance/events refer to them;
- migration function/path when the version changes;
- no raw provider payloads;
- no raw model prose as canonical truth;
- no authorization credentials;
- no duplicate copy of normalized legs/events/times merely for convenience.

## Promotion rule

A concept moves out of JSON when one or more become true:

```text
frequent indexed query
independent FK relationship
high-contention partial update
DB-level invariant materially reduces risk
cross-aggregate reference
separate retention/authorization lifecycle
```

---

# 7. PMA-06 — Completion criteria in JSON remain acceptable, but only provisionally

**Severity:** MEDIUM/HIGH
**Finding:** T0-033/T17 make completion criteria canonical, but do not yet prove they require their own table.

Current case shape:

```text
one Responsibility
2–small-N local criteria
updated through one reducer transaction
not globally queried
```

That fits typed aggregate JSON reasonably well.

## Mandatory falsifiers

Normalize criteria before implementation if remaining scenarios require:

- independent external-event FK per criterion;
- many concurrent writers changing separate criteria;
- direct global query/scheduling by criterion;
- criterion-specific authorization/retention;
- frequent provenance joins that become fragile with local JSON IDs.

Until then, normalization would add schema cost without demonstrated product value.

---

# 8. PMA-07 — Proposals/agreed facts should remain aggregate-local for now

**Severity:** MEDIUM
**Finding:** T0-009/T0-010/T05 prove proposal/agreement semantics exist, but not that Lunowa is a calendar/workflow database.

Current preferred representation:

```text
semantic_details.pending_proposals[]
semantic_details.agreed_facts[]
```

with stable local IDs and provenance.

Do not prematurely introduce:

```text
proposal table
term table
decision table
agreement graph
```

unless product integration later needs those identities independently.

If an accepted meeting time becomes a real calendar integration object, that integration may have its own normalized entity/anchor without forcing every email proposal into a generic negotiation database.

---

# 9. PMA-08 — Hold constraints in JSON are acceptable only because actionability is normalized

**Severity:** HIGH
**Finding:** a hold has operational consequences and cannot exist merely as explanatory text.

The hybrid candidate remains valid because the two critical execution-facing facts are normalized:

```text
obligation_leg.actionability = BLOCKED
expected_event = resume/approval pending
```

while the richer communicated constraint can remain typed detail:

```text
DO_NOT_PROCEED until counterpart resumes
```

If future constraints begin directly blocking provider tools/actions outside Responsibility reduction, promote the relevant enforcement rule to a dedicated policy/authorization boundary. Do not turn `constraints[]` into a generic executable expression language.

---

# 10. PMA-09 — ANY_OF assignment is the strongest current pressure against the hybrid

**Severity:** HIGH
**Finding:** T0-040 cannot safely be represented as two ordinary required obligation legs, but a full group-assignment subsystem is unvalidated.

Current safe shape:

```text
Responsibility exists
assignment source relation preserved as ANY_OF candidates
no individual accepted required leg is fabricated
material AMBIGUOUS_ASSIGNMENT uncertainty exists
projection = REVIEW
```

This fits typed details today.

## Falsifier

If detailed/organic cases show common transitions such as:

```text
ANY_OF candidates
-> one person claims work
-> claim transfers/relinquishes
-> another person takes over
```

then a minimal normalized Assignment/Claim structure may be justified.

Until evidence exists, do not build team collaboration machinery into a personal email product.

---

# 11. PMA-10 — Temporal facts need conflict-friendly currentness, not a uniqueness shortcut

**Severity:** CRITICAL
**Finding:** a naive constraint such as:

```text
UNIQUE(responsibility_id, kind) WHERE current=true
```

would break T0-028 because two unresolved decision-critical candidates may coexist.

The temporal layer must distinguish at least conceptually:

```text
ACCEPTED_CURRENT
CONFLICT_CANDIDATE
SUPERSEDED
HISTORICAL
```

Exact enums remain open.

Only one **accepted current** value might be enforceable for a given semantic target when there is no unresolved conflict. Conflict candidates must coexist until authority/correction resolves them.

This also reinforces that `SOURCE_DUE_CANDIDATE` is not a temporal kind; candidate/currentness/authority is orthogonal metadata.

---

# 12. PMA-11 — Parent `connected_account_id` is intentionally restrictive in v0.1

**Severity:** MEDIUM
**Finding:** a single parent account simplifies privacy, matching, reply identity, and provider provenance, and is aligned with the current cross-account no-merge rule.

Known OPEN question:

```text
can one real Responsibility legitimately continue across multiple threads/accounts often enough to justify cross-source identity?
```

Current decision:

```text
one Responsibility -> one connected account / normally one Conversation
```

for v0.1 physical design.

Do not weaken this boundary in anticipation of hypothetical cross-account continuity.

If production evidence shows frequent legitimate cross-thread continuation within the **same account**, first consider a minimal related/continuation relation before changing the parent to arbitrary many-to-many source ownership.

---

# 13. PMA-12 — Operational outcome text is identity semantics, not a machine primary key

**Severity:** MEDIUM
**Finding:** `operational_outcome_text` is useful for humans/product display but must not become the automatic merge key.

Identity matching uses evidence hierarchy such as:

```text
explicit relation/correction/supersession
same provider thread/conversation
same unresolved operational outcome
same artifact/context
participants
semantic similarity only as candidate retrieval
```

Do not add a magic semantic hash/embedding threshold as unique identity authority.

The opaque `responsibility_id` remains identity authority after creation.

---

# 14. PMA-13 — Safe action does not need a dedicated parent column yet

**Severity:** MEDIUM
**Finding:** T0-037 distinguishes:

```text
communicated requested action
accepted Responsibility obligation
safe next action
```

The original requested action lives in interpretation/provenance. The accepted safe current work can usually be represented by a USER obligation leg such as:

```text
VERIFY_AND_DECIDE_PAYMENT_REQUEST
```

A dedicated `safe_next_action` parent field would duplicate/flatten the obligation structure.

Allow a derived projection DTO to expose one primary safe action, selected deterministically from current state/policy.

If later high-risk workflows require a persistent authorization object, design that boundary separately rather than overloading Responsibility state.

---

# 15. PMA-14 — Domain events need correlation for composite effects

**Severity:** MEDIUM
**Finding:** T12 allows one focal event to affect multiple Responsibilities.

Each aggregate event row should support a shared application/evidence correlation identifier:

```text
correlation_id
source_event_key
```

so support/eval can answer:

```text
this one message caused:
R1 SUPERSEDE
R2 CREATE
```

without turning multiple aggregates into one transactional super-entity.

PostgreSQL can still commit both effects in one transaction when they are part of one trusted application command.

---

# 16. PMA-15 — Derived projection cache remains deferred

**Severity:** LOW/MEDIUM
**Finding:** storing `MY_TURN / WAITING / ...` is tempting for inbox queries, but premature caching risks making projection stale/authoritative.

Initial path:

```text
hydrate required parent + open legs/events/material uncertainty/time
-> deterministic projection
```

Only materialize/cache after realistic data shows unacceptable latency/query cost.

If introduced later:

```text
projection_bucket
projection_version
basis_aggregate_version
```

must be rebuildable and never substitute for canonical state.

---

# 17. Revised candidate physical boundary after audit

The strongest current candidate is now:

```text
responsibilities
responsibility_obligation_legs
responsibility_expected_events
responsibility_temporal_facts
responsibility_field_decisions
responsibility_provenance_refs
responsibility_domain_events

responsibilities.semantic_details_jsonb
  - completion criteria
  - constraints
  - proposals/agreed facts
  - uncertainty
  - unresolved shared-assignment semantics
  - target-scoped risk details when not naturally stored on a leg

existing separate:
AI interpretation runs
Messages/Attachments/provider observations
Temporal Contracts/Triggers
Draft/SendOperation
```

This remains a **candidate logical-to-physical boundary**, not exact DDL.

---

# 18. Minimum schema acceptance matrix before migrations

A physical schema proposal must show, explicitly, where each invariant lives and how it is tested.

At minimum:

| Requirement | Required proof |
| --- | --- |
| parallel obligations | T0-036 + T16 |
| conditional activation | T18 |
| hold != defer | T0-014 + T07 |
| cancellation != satisfaction | T0-015 + T08 |
| proposal != agreement | T0-009/T0-010 + T05/T06 |
| partial completion | T0-033 + T17 |
| field conflict | T0-028 + T13 |
| stale AI rejection | T15 |
| duplicate application | V16 + provider/job idempotency test |
| historical inactive open | T0-038 + T20 |
| cross-account isolation | T0-039 |
| any-of ambiguity | T0-040 |
| claim vs observation | T0-034 + T0-034-C23-OBSERVED |
| user field authority | T0-026/field-correction executable case + stale-AI test |
| composite supersession effects | T12 |
| source temporal provenance | T0-001/T0-027/T19 |

If a proposed DDL cannot point to a clean representation + enforcement/test path for every row, it is not ready.

---

# 19. What still blocks schema freeze

The hybrid candidate is now materially stronger, but freezing it before the following would still be premature:

1. expand outbound request/commitment direction cases T0-003/T0-004;
2. expand commitment-strength ladder T0-005..008 to ensure no extra persisted lifecycle dimension is needed;
3. expand review/approval/preference T0-011..013;
4. expand direct-vs-CC and quote/forward zoning T0-020..025 to verify these stay interpretation/admission concerns rather than persistence structures;
5. expand user target vs source due T0-026 and decide the minimal current field-authority representation;
6. expand REOPEN vs new episode T0-029/T0-030 and sequential-vs-independent outcomes T0-031/T0-032;
7. expand T0-041..044 to verify ambiguity/private-intent cases fit typed uncertainty without new state machinery;
8. turn the schema acceptance matrix above into an implementation-ready DDL review artifact only after these cases are checked.

---

# 20. Audit verdict

The current evidence favors a hybrid model because it minimizes both dominant failure modes:

```text
Too simple:
  one lifecycle enum / scalar owner / one deadline / giant JSON blob
  -> semantic corruption, unsafe hiding, weak auditability

Too complex:
  table/engine for every semantic concept
  -> solo-dev maintenance cost, workflow-platform drift, slower validation
```

The preferred boundary is therefore:

> **Normalize what drives identity, projection, temporal safety, authority, and concurrency; keep low-query local semantic structure typed and versioned until real evidence justifies further normalization.**

No migration should be written until the remaining schema-falsifier oracles have had a chance to overturn this conclusion.
