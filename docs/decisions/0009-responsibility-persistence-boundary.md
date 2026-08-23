# ADR 0009 — Responsibility Persistence Uses a Hybrid Logical Boundary

## Status

Accepted — 2026-08-23

## Context

ADR 0008 fixed the semantic requirement that Responsibility state is orthogonal rather than one lifecycle enum. The remaining question was how much of that semantic model should become normalized persistence.

Two failure modes were both plausible:

```text
Under-model:
  one lifecycle enum / scalar owner / one deadline / giant JSON blob

Over-model:
  one table or workflow primitive for every semantic nuance
```

To avoid deciding from aesthetic preference, the persistence boundary was pressure-tested against:

- 44/44 fully layered Tier-0 base semantic oracles;
- 20/20 transition traces;
- high-harm forbidden outcomes;
- cross-account, historical, parallel, conditional, conflict, correction, proposal, safety, and ambiguity cases;
- three adversarial physical-model audits.

The final planned schema falsifiers added no new persistence aggregate after the pre-admission Review boundary was introduced. Remaining pressure was limited to metadata refinements inside already-justified structures.

## Decision

Responsibility v0.1 freezes a **hybrid logical persistence boundary**.

This ADR freezes the L1 logical architecture, not exact PostgreSQL/Drizzle DDL.

### Accepted Responsibility aggregate

Conceptually:

```text
Responsibility
├─ ObligationLeg[]
├─ ExpectedEvent[]
├─ TemporalFact[]
├─ FieldDecision[]
├─ ProvenanceReference[]
├─ DomainEvent[]
└─ SemanticDetails (typed/versioned local document)
```

`Responsibility` remains the communication-bounded operational episode identity.

### Normalized structures

Normalize structures with demonstrated cardinality/query/relationship/concurrency/invariant pressure:

```text
ObligationLeg
ExpectedEvent
TemporalFact
FieldDecision
ProvenanceReference
DomainEvent
```

### Typed aggregate-local semantic details

Keep low-global-query, Responsibility-local, still-evolving detail inside a strictly typed/versioned semantic details document, initially including concepts such as:

```text
completion criteria
constraints
pending proposals
agreed facts
field-scoped uncertainties
unresolved ANY_OF/shared-assignment semantics
target-scoped risk detail where no normalized owner is more natural
```

A semantic concept does not get a table merely because it exists.

Promote a detail out of the typed document only when real evidence demonstrates pressure such as:

```text
frequent indexed query
independent FK identity
cross-aggregate reference
high-contention partial update
material DB-level invariant
independent authorization/retention lifecycle
independent scheduling/execution ownership
```

### Pre-admission Review is a separate product-state boundary

When Responsibility admission itself remains unresolved and the product must surface/persist that uncertainty, use a narrow pre-admission Review artifact.

Conceptually:

```text
AdmissionReview
```

It is not a Responsibility and is not a copy of every AI candidate.

A determinate `DO_NOT_TRACK` result normally creates neither a Responsibility nor AdmissionReview product-state row.

### Inference/evidence systems remain separate

These are not canonical Responsibility state:

```text
Message / Attachment / provider observations
AIInterpretationRun
```

AI output remains candidate interpretation/evidence processing input.

### Operational authorities remain separate

Durable operational subsystems stay outside the Responsibility aggregate:

```text
TemporalContract / TemporalTrigger
Draft / SendOperation
```

Responsibility state may reference/coordinate with these systems but does not absorb their authority.

## Critical logical invariants

The L1 boundary must preserve:

```text
resolution != live activation != attention
multiple obligation legs are possible
known future blocked obligation may exist before actionability
REOPEN preserves prior history rather than rewinding it
one linguistic verb != one persisted obligation leg
one message may create/update multiple Responsibilities
SOURCE_DUE may target USER or OTHER obligation
extracted time phrase != accepted TemporalFact
USER_TARGET != source-field override
claim != provider/external observation
semantic approval != authoritative approval satisfaction
admission REVIEW != field REVIEW inside accepted Responsibility
DO_NOT_TRACK != fake resolved Responsibility
cross-account semantic auto-merge prohibited
stale AI cannot mutate current accepted state
duplicate source application must be idempotent
```

## Required refinements inside the boundary

Before exact DDL approval, concrete schema design must account for:

### Expected-event basis

Where product behavior/explanation depends on it, accepted expected events may need narrow metadata such as:

```text
basis_kind
expectation_strength
```

This preserves plan/intention/firm distinctions without lifecycle explosion.

Capability evidence must not automatically become an expected event/time.

### Provenance support role

When one accepted fact depends on multiple source zones, provenance should be able to distinguish roles such as:

```text
COMMUNICATIVE_FORCE
OBJECT_CONTEXT
TEMPORAL_SOURCE
AUTHORITY_SUPPORT
PROVIDER_OBSERVATION
CORRECTION_TARGET
```

Exact enum names remain open.

### FieldDecision scope

FieldDecision stores current accepted authority decisions about supported semantic fields. It is not generic EAV and does not own every user-originated fact.

### Idempotency / concurrency

A concrete schema must provide a mechanical source-event application boundary and stale-safe evidence/aggregate version checks.

### Risk

Any parent aggregate risk is only a derived/conservative summary. Canonical harm may be scoped to an obligation, field, safe action, or side effect.

## Alternatives considered

### Fully normalized semantic schema

Rejected for v0.1. It would create tables/joins/migrations for low-query local concepts before product evidence justifies the maintenance burden.

### One Responsibility row with giant semantic JSON

Rejected. It weakens core relational invariants, projection queries, field authority, temporal querying, and provenance/concurrency guarantees.

### Generic workflow/BPMN engine

Rejected. The validated product semantics do not require arbitrary workflow graphs or user-defined workflow infrastructure.

### Admission uncertainty as fake Responsibility

Rejected. `NEEDS_REVIEW` may occur before the product has accepted that a Responsibility exists.

### AIInterpretationRun as product Review truth

Rejected. Inference runs may be stale/rejected/replaced and are intentionally non-authoritative.

## Consequences

Positive:

- enough relational structure for the product's core projection and safety invariants;
- avoids schema explosion for low-query semantic nuance;
- preserves explainability and field authority;
- handles parallel/conditional obligations and temporal conflicts;
- supports admission uncertainty without corrupting Responsibility identity;
- remains implementable by a solo developer;
- keeps generic workflow complexity out of the MVP.

Costs/trade-offs:

- the reducer must hydrate several child structures for non-trivial updates;
- typed JSON details need runtime versioning/migrations;
- query/transaction discipline is more complex than a single task-state row;
- exact DDL must be carefully reviewed for idempotency and temporal-conflict behavior.

## What this ADR does not freeze

This ADR does not approve:

```text
exact table names
exact column names/types
enum labels/cardinality
indexes
unique/check constraints
JSON schema field names
Drizzle definitions
migration files
projection cache/materialization
```

Those are L2 decisions.

## Verification

The L1 boundary is validated against the acceptance matrix in:

```text
docs/product/responsibility/PHYSICAL-SCHEMA-FREEZE-REVIEW.md
```

Primary oracle sources include:

```text
TIER-0-CRITICAL-ORACLES.md
TIER-0-DETAILED-ORACLES-BATCH-2.md
TIER-0-DETAILED-ORACLES-BATCH-3.md
TIER-0-DETAILED-ORACLES-BATCH-4.md
TRANSITION-ORACLES.md
```

Before migrations, the L2 DDL review must map every proposed persistent element back to a frozen L1 requirement, oracle, query path, or concurrency/security invariant.

## Revisit when

Reopen this ADR only if stronger scenario/production evidence demonstrates a structural need such as:

- frequent cross-conversation Responsibility identity that breaks the current ownership boundary;
- persistent shared-assignment claim/transfer workflow beyond current Review/details semantics;
- criteria/proposals requiring independent FKs/synchronization/authorization;
- constraints becoming independently executable authorization objects;
- another authority/concurrency requirement that cannot fit the accepted structures safely.

Do not reopen it merely because another schema style is aesthetically preferable.