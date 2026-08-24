# Responsibility Physical Model Design v0.1

## Status

**Candidate physical-model design — NOT FROZEN and NOT IMPLEMENTATION AUTHORITY yet.**

This document converts the accepted Responsibility v0.1 semantics into the smallest plausible PostgreSQL-oriented persistence shape that can later be implemented without recreating the superseded single-lifecycle model or building a generic workflow engine.

The purpose is to make the next architectural question falsifiable:

> **What is the minimum physical representation that can satisfy the canonical scenarios, transition traces, query needs, provenance requirements, and concurrency invariants?**

This document may be rejected or revised by stronger detailed-oracle evidence before Phase-2 schema implementation.

Primary semantic sources:

- `DECISIONS.md`;
- `SCENARIO-SCHEMA.md`;
- `TRANSITION-SCHEMA.md`;
- `TIER-0-CRITICAL-ORACLES.md` + `CONSISTENCY-AUDIT.md` compatibility rules;
- `TIER-0-DETAILED-ORACLES-BATCH-2.md`;
- `TRANSITION-ORACLES.md`;
- ADR `docs/decisions/0008-responsibility-state-is-orthogonal.md`.

Broader persistence/runtime sources:

- `../DATA-MODEL.md`;
- `../CONTRACTS.md`;
- `../ARCHITECTURE.md`;
- `../TECH-STACK.md`.

---

# 1. Design objective

Optimize for:

```text
semantic correctness
+ explainability/provenance
+ deterministic query/projection
+ safe concurrency/reconciliation
+ low solo-developer maintenance
- schema/state explosion
- generic workflow machinery
- premature normalization
- opaque core JSON blobs
```

The target is **not** a maximally normalized academic schema. The target is the smallest model that preserves the distinctions that have already proven necessary.

---

# 2. Required query/workload shape

The physical design must support Lunowa's actual product flows efficiently enough without inventing future enterprise workflow requirements.

Primary expected queries:

```text
1. list current live Responsibilities for one user/scope/account
2. derive My Turn / Waiting / Later / Done / Review
3. find Responsibilities inside one Conversation
4. find open actionable USER obligation legs
5. find pending OTHER/EXTERNAL expected events
6. find current material source/expected times for sorting/safety
7. re-evaluate one Responsibility after a message, send reconciliation, trigger, correction, or external event
8. trace why a current field/projection exists
9. reject stale concurrent/AI work against the current evidence revision/version
10. rebuild conversation-level aggregate projection
```

Not current requirements:

```text
arbitrary workflow graph traversal
cross-company task assignment engine
BPMN authoring
custom user workflow schemas
querying every semantic subfield across all users
multi-service event-sourced reconstruction as the normal read path
```

---

# 3. Alternatives evaluated

## Alternative A — Fully normalized semantic model

Possible shape:

```text
responsibilities
obligation_legs
expected_events
completion_criteria
constraints
proposals
agreed_facts
temporal_facts
uncertainties
provenance_refs
field_decisions
domain_events
```

### Strengths

- strongest relational constraints;
- every semantic concept individually queryable;
- easy targeted provenance/FK relationships;
- clean partial updates.

### Weaknesses

- too many tables and joins before product usage proves independent query needs;
- high migration/reducer/test surface for one developer;
- encourages treating every semantic dimension as a generalized workflow primitive;
- risks designing around hypothetical complexity rather than Lunowa's projection UX.

**Verdict:** too normalized for first implementation.

---

## Alternative B — One Responsibility row with a large JSON state document

Possible shape:

```text
responsibilities {
  id
  semantic_state_jsonb
}
```

### Strengths

- fastest schema evolution;
- aggregate can be loaded/written atomically;
- minimal migration surface.

### Weaknesses

- weak database constraints on the most important relationships;
- poor queryability for actionable USER legs / waiting events / current due facts;
- provenance links become string-path conventions;
- concurrency and partial corrections become easier to get wrong;
- recreates a different kind of monolithic state blob even if the old lifecycle enum disappears.

**Verdict:** too opaque for core Responsibility truth.

---

## Alternative C — Hybrid relational core + typed low-query semantic details

Normalize the structures that are:

- cardinality-bearing;
- relationship-bearing;
- heavily queried by the main product projection;
- important for deterministic constraints.

Keep low-query, rapidly evolving semantic detail inside a **strictly versioned, runtime-validated typed details document**, with durable domain-event history/provenance.

**Verdict:** current preferred candidate.

This is not “use JSON to move faster.” The boundary is based on demonstrated query/invariant pressure.

---

# 4. Candidate aggregate boundary

A Responsibility remains the consistency aggregate for its accepted semantic state.

Conceptually:

```text
Responsibility
├─ scalar orthogonal parent state
├─ ObligationLeg[]               normalized
├─ ExpectedEvent[]               normalized
├─ TemporalFact[]                normalized
├─ SemanticDetails               typed/versioned JSON document
│  ├─ completion criteria
│  ├─ constraints
│  ├─ pending proposals
│  ├─ agreed facts
│  └─ field-scoped uncertainties
├─ ProvenanceReference[]         normalized audit/source links
└─ ResponsibilityDomainEvent[]   append-only history/audit
```

User corrections and AI interpretation runs remain separate authority/history concerns rather than being folded into the semantic JSON document as anonymous values.

---

# 5. Candidate `responsibilities` parent

Conceptual physical row:

```text
Responsibility {
  id
  user_id
  conversation_id
  connected_account_id

  operational_outcome_text

  resolution_status
  resolution_reason?
  activation_status
  attention_mode
  risk_class?

  semantic_details_version
  semantic_details_jsonb

  evidence_revision
  aggregate_version

  resolved_at?
  created_at
  updated_at
}
```

### 5.1 Why these are parent columns

They affect common list/filter/domain operations and are not optional semantic decorations:

```text
resolution_status   -> Open vs terminal
resolution_reason   -> satisfaction vs cancellation/decline/supersession/etc.
activation_status   -> live tracked vs historical inactive candidate
attention_mode      -> present vs intentionally deferred
```

They are intentionally **not** one combined enum.

### 5.2 Candidate activation semantics

The exact enum name remains open, but the minimum demonstrated distinction is:

```text
ACTIVE
INACTIVE_HISTORICAL_CANDIDATE
```

A recently resolved Responsibility can remain part of the active/current tracking episode for Done/history presentation while `resolution_status=RESOLVED`.

Activation does not mean “unresolved.”

### 5.3 Candidate attention semantics

Minimum demonstrated distinction:

```text
PRESENT
DEFERRED
```

Invariant:

```text
DEFERRED requires an unresolved, actively tracked Responsibility
and an accepted durable return condition / Temporal Contract.
```

Communication hold alone does not set `DEFERRED`.

### 5.4 Deliberately absent parent columns

Do **not** add as canonical truth:

```text
lifecycle_state
next_owner
BOTH
deadline_at
follow_up_state
uncertain_state
active boolean with overloaded meaning
completed boolean
```

A derived/cached projection field may later be justified for performance, but it must remain rebuildable and non-authoritative.

---

# 6. Candidate `responsibility_obligation_legs`

Normalize obligation legs because parallel/conditional state is core to both correctness and projection.

Conceptual row:

```text
ResponsibilityObligationLeg {
  id
  responsibility_id

  bearer_kind
  bearer_participant_id?

  action_kind_or_code
  action_summary?
  object_ref_or_summary?

  leg_status
  actionability

  basis_kind
  authority_status?

  condition_expected_event_id?

  created_at
  closed_at?
  updated_at
}
```

Exact action taxonomy and enums remain open.

### Required invariants

- all rows belong to the same `user_id`/Responsibility authority boundary through the parent;
- a `USER` bearer does not require a fake external participant row;
- `PARTICIPANT` bearer requires the relevant participant identity/reference when known;
- a BLOCKED contingent leg may reference an expected event/condition;
- satisfying one leg does not resolve the parent if other required legs/criteria remain open;
- scalar `BOTH` is not a replacement for two legs;
- ANY_OF/shared ambiguity may remain in semantic details/review until a minimal validated assignment representation is justified.

### Why not JSON here

`My Turn` and `Waiting` depend directly on open/actionable legs. Parallel/conditional cases are already canonical. This is core query/invariant data rather than incidental interpretation detail.

---

# 7. Candidate `responsibility_expected_events`

Normalize expected events because Waiting, conditional activation, reply triggers, and external conditions depend on them.

```text
ResponsibilityExpectedEvent {
  id
  responsibility_id

  actor_kind
  actor_participant_id?
  event_kind_or_code
  event_summary?

  status

  activates_obligation_leg_id?

  created_at
  satisfied_at?
  updated_at
}
```

Examples:

```text
counterpart reply expected
revised document expected
legal approval expected
external event expected
```

### Required invariants

- a pending event can block a known future USER leg;
- satisfying the event can change actionability without creating a new Responsibility;
- event satisfaction requires appropriate evidence authority;
- a sender claim that an event happened is not automatically equivalent to provider/external observation;
- pending event existence does not imply user notification strength.

---

# 8. Candidate `responsibility_temporal_facts`

Normalize material source/semantic temporal facts because multiple different times can coexist and the product needs reliable sorting/explanation.

```text
ResponsibilityTemporalFact {
  id
  responsibility_id

  kind
  original_expression?

  resolved_date?
  resolved_at?
  precision
  timezone_or_reference_frame?

  anchor_kind?
  anchor_id?

  obligation_leg_id?
  expected_event_id?

  currentness_status
  authority_status?

  created_at
  superseded_at?
  updated_at
}
```

Minimum semantic kinds at this layer:

```text
SOURCE_DUE
EXPECTED_EVENT_TIME
USER_TARGET
```

### 8.1 Why `RESURFACE_TIME` / `FOLLOW_UP_TIME` are not necessarily duplicated here

Canonical semantics distinguish those time meanings, but their **physical owner** is usually the accepted `TemporalContract` / `TemporalTrigger` subsystem because they are product promises/policies rather than source facts.

Therefore the initial physical model SHOULD avoid copying them into `responsibility_temporal_facts` unless a concrete read/query requirement proves duplication useful.

Conceptual semantics remain unified; physical ownership remains explicit.

### Required invariants

- one `deadline_at` cannot replace this table;
- relative source expressions preserve source wording/precision;
- source date resolution uses source reference context, not ingestion time;
- corrected/conflicting facts preserve history/provenance rather than overwriting evidence;
- calendar-anchor movement changes derived resolution, not source expression;
- source legitimacy does not change temporal semantic kind.

---

# 9. Candidate `semantic_details_jsonb`

The current preferred hybrid keeps several low-global-query structures as one **strict typed Responsibility-details document**.

Conceptual runtime schema:

```text
ResponsibilitySemanticDetailsV1 {
  completion_criteria[]
  constraints[]
  pending_proposals[]
  agreed_facts[]
  uncertainties[]
  assignment_semantics?
}
```

Every element carries a stable local ID where later event/history/provenance needs to refer to it.

### 9.1 Completion criteria

Example:

```text
FRONT_SIDE_PROVIDED
BACK_SIDE_PROVIDED
```

They affect reducer closure but are not currently required as a frequent cross-user/global query dimension.

If future product/query evidence needs “find all open Responsibilities missing criterion X,” normalize them then.

### 9.2 Constraints

Examples:

```text
DO_NOT_PROCEED until resume
format must be PDF
must not send before legal approval
```

Constraints are intentionally **not** a generic policy/workflow language.

Only structures demonstrated by real/canonical communication cases belong here.

### 9.3 Pending proposals / agreed facts

Needed for scheduling/negotiation semantics, but not currently a primary inbox-list query.

The domain reducer promotes pending terms to agreed facts only with adequate acceptance evidence.

### 9.4 Uncertainties

Field-scoped material uncertainty belongs here when it affects accepted semantic state:

```text
CONFLICTING_EVIDENCE
MISSING_CONTEXT
AMBIGUOUS_ASSIGNMENT
SOURCE_NOISE
```

A derived `has_material_review_condition` may later be cached for list-query performance. The uncertainty details remain canonical evidence-relative state.

### Why one typed details document instead of four more tables

Current evidence requires these concepts to be represented, but not independently indexed/joined across the product.

Using a versioned runtime schema keeps:

- the aggregate explicit;
- migrations smaller;
- rare semantic structures evolvable;
- generic workflow-table pressure low.

This boundary must be revisited if real query/concurrency behavior makes JSON mutation brittle.

---

# 10. Provenance

Decision-critical facts must remain traceable regardless of model confidence.

Candidate normalized reference:

```text
ResponsibilityProvenanceReference {
  id
  responsibility_id

  target_kind
  target_id?
  field_key?

  evidence_kind
  message_id?
  provider_observation_key?
  interpretation_run_id?
  domain_event_id?

  source_locator?
  source_excerpt_short?

  created_at
}
```

### Why a generic target is acceptable here

This table is an audit/reference layer, not the canonical business-state model. A polymorphic target here does not turn Responsibility semantics into EAV state.

Do not duplicate full sensitive message bodies into provenance rows.

---

# 11. Domain history without event sourcing as the primary store

Use current-state tables for normal reads and append durable semantic history for explanation/concurrency/audit.

Candidate:

```text
ResponsibilityDomainEvent {
  id
  responsibility_id

  operation
  actor_kind
  reason_codes[]

  basis_evidence_revision
  resulting_aggregate_version

  source_event_id?
  interpretation_run_id?

  change_summary_jsonb

  occurred_at
}
```

This records effects such as:

```text
CREATE
UPDATE
RESOLVE
REOPEN
SUPERSEDE
INVALIDATE
NO_OP when audit-worthy
```

It does **not** require reconstructing every read from the entire event stream.

### Composite effects

One evidence event may append domain events/effects for multiple Responsibilities inside one transaction/application command, for example:

```text
SUPERSEDE R1
CREATE R2
```

---

# 12. User field authority / corrections

Do not restore whole-item `user_override_state`.

Two viable physical approaches remain:

### Candidate A — append field-scoped domain correction events

```text
ResponsibilityDomainEvent.change_summary_jsonb {
  field_decisions[] {
    field_key
    value
    authority: USER
    basis_revision
  }
}
```

Current materialized state reflects the latest still-valid field authority.

### Candidate B — separate `responsibility_field_decisions` table

Useful if current field authority must be queried independently/frequently.

**Initial preference:** Candidate A plus materialized current state, unless implementation evidence shows a dedicated lookup table materially simplifies correctness.

The semantic requirement is fixed:

```text
user correction is field-scoped
and stale AI cannot overwrite it
```

---

# 13. AI interpretation persistence stays separate

`AIInterpretationRun` remains separate from accepted Responsibility truth.

Required linkage:

```text
basis_evidence_revision
schema/config/model versions
candidate facts
status
provenance
```

An interpretation run may be retained after becoming stale, but:

```text
stale run -> no current state mutation
```

The physical Responsibility aggregate should not store raw model output as canonical state.

---

# 14. Temporal Contract remains separate authority

Do not fold durable scheduling into Responsibility JSON.

Physical ownership remains:

```text
Responsibility semantic state
     ↕ domain commands
TemporalContract
     └─ TemporalTrigger[]
```

`attention_mode=DEFERRED` is accepted Responsibility state; the actual durable return promise/trigger is owned by TemporalContract/Trigger.

Invariant:

```text
DEFERRED without a valid durable return contract is invalid for material live work.
```

A trigger firing causes re-evaluation; it does not directly write a UI bucket.

---

# 15. Projection strategy

Initial implementation SHOULD compute deterministic projection from authoritative rows at the domain/application boundary rather than store it as sole truth.

Conceptual:

```text
if activation inactive -> NONE/REVIEW policy
else if resolved -> DONE
else if material review condition -> REVIEW
else if attention deferred -> LATER
else if open actionable USER leg -> MY_TURN
else if pending OTHER/EXTERNAL event/leg -> WAITING
else -> REVIEW
```

A cached/materialized projection may be introduced only when measured list-query cost requires it.

If cached, store enough derivation/version metadata to rebuild/invalidate it.

---

# 16. Candidate relational invariants

These should eventually be mechanically enforced where practical through DB constraints + trusted reducer logic.

## Parent invariants

```text
RESOLVED -> resolution_reason is non-null
OPEN -> resolution_reason is null
INACTIVE_HISTORICAL_CANDIDATE -> must not project live MY_TURN
DEFERRED -> resolution_status=OPEN AND activation_status=ACTIVE
```

## Account/scope invariants

```text
Responsibility.connected_account_id belongs to Responsibility.user_id
Conversation/account relationship is authorized and consistent
cross-account semantic matching cannot update another account's Responsibility automatically
```

## Obligation invariants

```text
BLOCKED leg with an activation event keeps the future obligation represented
one satisfied leg does not imply parent resolution
no scalar BOTH substitution for parallel required legs
```

## Expected-event invariants

```text
satisfaction requires accepted evidence
sender claim != provider/external observation
satisfying activation event can unblock referenced leg transactionally
```

## Temporal invariants

```text
one current source fact may coexist with superseded historical facts
conflict may preserve multiple unresolved candidates
no silent precision increase
source expression immutable
```

## Concurrency invariants

```text
reducer command reads current evidence_revision + aggregate_version
write uses compare-and-set/transaction semantics where races matter
stale basis revision cannot apply
idempotent source event cannot apply twice
```

---

# 17. Transaction pattern

A non-trivial accepted domain change should conceptually execute as:

```text
1. authorize user/account/entity access
2. load current Responsibility aggregate + evidence revision/version
3. validate focal evidence / stale basis
4. run trusted reducer
5. validate resulting semantic invariants
6. write parent/child/details changes transactionally
7. append ResponsibilityDomainEvent/effect history
8. persist/update provenance references
9. create/update/cancel Temporal Contract intent when required
10. commit
11. enqueue/recompute rebuildable projections/background work
```

Do not let scheduler/AI/UI write individual Responsibility tables ad hoc.

---

# 18. Index/query candidate

Initial indexes should come only from demonstrated product paths.

Likely:

```text
responsibilities(user_id, activation_status, resolution_status, attention_mode)
responsibilities(conversation_id)
responsibilities(connected_account_id, updated_at)

responsibility_obligation_legs(responsibility_id, leg_status, actionability)
responsibility_obligation_legs(responsibility_id, bearer_kind, leg_status)

responsibility_expected_events(responsibility_id, status)

responsibility_temporal_facts(responsibility_id, kind, currentness_status)
responsibility_temporal_facts(kind, resolved_at) WHERE current/material if useful

responsibility_domain_events(responsibility_id, occurred_at)
responsibility_provenance_refs(responsibility_id)
```

Do not create speculative indexes for every JSON key or semantic subtype.

---

# 19. Scenario falsification matrix

The candidate hybrid must represent these without ad-hoc lifecycle states:

| Oracle / trace | Physical pressure | Candidate representation |
| --- | --- | --- |
| T0-036 / T16 parallel signers | two simultaneous required legs | normalized `obligation_legs` |
| T18 conditional signature | known future blocked USER leg + legal approval | `obligation_leg.condition_expected_event_id` + `expected_events` |
| T0-040 ANY_OF assignment | material shared assignment but no unique bearer | typed semantic-details assignment/uncertainty; do not fabricate legs |
| T0-033 / T17 partial front/back | multiple closure criteria | typed `completion_criteria[]` details |
| T0-009/T0-010/T05 proposal/agreement | pending term then accepted fact | typed proposal/agreed-fact details + history |
| T0-014/T07 hold | blocked leg + prohibition + resume event | leg actionability + constraint details + expected event |
| T0-015/T08 cancellation | terminal but not satisfied | parent resolution status/reason |
| T0-028/T13 conflict | multiple temporal claims + material review | normalized temporal facts + uncertainty details |
| T0-038/T20 historical import | evidence-relative OPEN but not live | parent activation status |
| T0-039 cross-account | false merge hazard | parent account boundary + matcher prohibition |
| T15 stale AI | concurrency rollback hazard | evidence_revision + aggregate_version + run basis |
| T12 supersede + create | one event affects two aggregates | application transaction + domain-effect events |
| T19 moving calendar anchor | derived time changes, source stable | temporal fact anchor/reference + history |
| C23 claim vs observation | field-specific evidence authority | claim in interpretation/history + provider observation/provenance |

If the model cannot represent any row above cleanly, reject it before coding.

---

# 20. Why not normalize completion criteria/proposals/constraints immediately?

The strongest argument **for** more normalization is referential integrity and targeted updates.

The strongest argument **against** it now is product/maintenance cost:

- these structures are currently low-cardinality and Responsibility-local;
- current UI list projection does not need global queries over them;
- exact taxonomy is still under oracle pressure;
- adding generic relational tables too early encourages generalized workflow abstractions;
- typed versioned JSON preserves explicit semantics while remaining migratable.

Therefore the current rule is:

> **Normalize when relationship/query/concurrency pressure is proven, not merely because a semantic concept exists.**

This is a reversible design decision before user data exists.

---

# 21. Falsifiers / mandatory reasons to revise this candidate

Revise before implementation if remaining detailed oracles demonstrate any of the following:

1. completion criteria need independent identity/FKs across other entities often enough that JSON becomes unsafe;
2. proposal/agreement state needs frequent cross-Responsibility querying or direct calendar synchronization that requires normalized identity;
3. constraints become independently executable/authorizable objects rather than local semantic conditions;
4. ANY_OF/shared assignment needs persistent claim/assignment transitions that cannot be represented safely without a minimal normalized assignment structure;
5. one Responsibility frequently spans multiple Conversations/ConnectedAccounts in a way that invalidates the current parent ownership boundary;
6. field-level user authority requires frequent current-state lookup that domain-event history alone makes error-prone;
7. projection queries require repeated expensive aggregate hydration at realistic inbox size, justifying a rebuildable materialized projection;
8. transactional updates to typed details become conflict-prone under real concurrent events;
9. a canonical scenario cannot be expressed without adding another overloaded scalar parent state.

---

# 22. Deliberate non-goals

Do not add in v0.1 unless stronger evidence requires them:

```text
generic workflow nodes/edges
BPMN engine
arbitrary condition expression language
team task assignment system
project/dependency graph
cross-account Responsibility merge engine
recurring-series engine
vector identity store
separate service per Responsibility component
CQRS/event sourcing as primary persistence
```

The differentiated value is a trustworthy communication-responsibility reduction, not workflow-platform flexibility.

---

# 23. Implementation gate

This candidate is sufficiently concrete to pressure-test, but **not yet ready for migration code**.

Before physical schema freeze:

1. expand the remaining Tier-0 cases most capable of breaking this hybrid boundary;
2. explicitly challenge the JSON-vs-normalized decision for criteria/proposals/constraints/shared assignment;
3. normalize the first eight legacy oracle aliases during executable serialization;
4. verify C23 as two explicit executable inputs;
5. write a schema-level acceptance matrix mapping every persisted structure to at least one canonical oracle/query/invariant;
6. only then convert the accepted minimal shape into Drizzle/PostgreSQL migrations.

The next oracle batch should therefore be chosen partly as an **adversarial schema review**, not merely to increase the `18/44` count.

Highest-value remaining schema falsifiers:

```text
T0-003 / T0-004 outbound direction pair
T0-005..008 commitment-force ladder
T0-011..013 preference/review/approval
T0-018 / T0-019 material request vs courtesy
T0-020 / T0-021 direct assignment vs CC
T0-022..025 quote/forward zoning
T0-026 user target vs source due
T0-029 / T0-030 reopen vs new episode
T0-031 / T0-032 sequential one outcome vs independent outcomes
T0-041..044 ambiguity/missing-context/sarcasm/user-dependent cases
```

A physical model should be frozen only after those cases fail to reveal a cheaper or necessary structural change.