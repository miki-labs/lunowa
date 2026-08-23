# Responsibility semantics

## Status

**Accepted Responsibility v0.1 semantic baseline and accepted v0.1 logical persistence boundary.**

This directory now has two distinct freeze levels:

```text
L0 semantic model                         FROZEN v0.1 baseline
L1 logical persistence boundary           FROZEN v0.1 baseline
L2 exact PostgreSQL/Drizzle DDL            OPEN
L3 migrations/runtime                     NOT STARTED
```

`FROZEN` here means “versioned baseline that requires an explicit superseding decision if stronger evidence breaks it.” It does not mean immutable forever.

## Scope and precedence

This directory is normative for Responsibility semantics, annotation/evaluation behavior, and the L1 persistence-boundary decision.

Broader documents such as:

```text
docs/product/ARCHITECTURE.md
docs/product/DATA-MODEL.md
docs/product/CONTRACTS.md
docs/design/INTERACTIONS.md
```

have been reconciled against v0.1. If a future contradiction appears, treat it as a specification defect and reconcile it explicitly.

This directory still does **not** freeze:

- exact SQL table/column names;
- exact enum labels/cardinality;
- indexes/check/unique constraints;
- exact JSON schema details;
- Drizzle implementation;
- model/provider/prompt choice;
- numeric confidence/risk thresholds;
- similarity thresholds;
- number of AI retries/reruns;
- cross-thread Responsibility merging;
- recurring Responsibility machinery;
- generic team workflow machinery.

## Documents

- `ANNOTATION-GUIDELINES.md` — normative evidence/communication/admission/identity/safety definitions and annotation procedure.
- `DECISIONS.md` — FIXED principles, strong implementation directions, OPEN questions, and superseded decisions.
- `CONSISTENCY-AUDIT.md` — cross-document reconciliation, compatibility aliases, oracle errata, and promotion gates.
- `SCENARIO-SCHEMA.md` — canonical focal-event scenario/evaluation contract.
- `TRANSITION-SCHEMA.md` — multi-event trace contract with semantic/observed chronology, evidence revisions, composite effects, conditional activation, and step-level forbidden outcomes.
- `COVERAGE-PLAN.md` — corpus-level mandatory coverage inventory, contrasts/interactions, mutants, transitions, metamorphic relations, and completion gates.
- `TIER-0-SCENARIO-MATRIX.md` — 44 base semantic-oracle assignments and controlled variants.
- `TIER-0-CRITICAL-ORACLES.md` — first eight full high-risk/high-connectivity detailed oracles; legacy aliases are normalized before executable serialization.
- `TIER-0-DETAILED-ORACLES-BATCH-2.md` — ten additional detailed oracles plus the explicit observation-confirmed C23 counterpart.
- `TIER-0-DETAILED-ORACLES-BATCH-3.md` — ten schema-falsifier oracles covering outbound direction, user-target/source-due, REOPEN/new episode, multiplicity, and pre-admission Review.
- `TIER-0-DETAILED-ORACLES-BATCH-4.md` — final sixteen Tier-0 detailed oracles covering commitment force, preference/review/approval, materiality/courtesy, direct-vs-CC assignment, quote/forward zoning, and non-literal ambiguity.
- `TRANSITION-ORACLES.md` — semantic traces for all 20 mandatory transition/event sequences.
- `PHYSICAL-MODEL-DESIGN.md` — original hybrid persistence candidate used as the falsifiable starting point.
- `PHYSICAL-MODEL-AUDIT.md` — first adversarial physical-model pass.
- `PHYSICAL-MODEL-AUDIT-BATCH-3.md` — second pass; adds pre-admission Review and narrows several structures.
- `PHYSICAL-MODEL-AUDIT-BATCH-4.md` — final Tier-0 falsifier pass; finds no new aggregate/table requirement and adds only expected-event/provenance metadata pressure.
- `PHYSICAL-SCHEMA-FREEZE-REVIEW.md` — authoritative L1 freeze decision and acceptance matrix; exact L2 DDL remains open.

## Coverage / oracle status

Design coverage:

```text
FIXED-rule sentinels: 50 / 50
minimal contrasts: 32 / 32
mandatory two-way interactions: 29 / 29
mandatory high-risk three-way interactions: 16 / 16
semantic mutants: 40 / 40 killer mapping
metamorphic relations: 20 / 20
high-harm forbidden outcomes: 15 / 15
ambiguity/oracle families: 10 / 10
transition/event traces: 20 / 20
```

Detailed Tier-0 expansion:

```text
base semantic assignments:       44 / 44
detailed layered base oracles:   44 / 44
mandatory transition traces:     20 / 20
C23 claim-vs-observation pair:   explicit at specification level
```

This is **not** execution evidence. The corpus is not yet fully serialized/executed/production-validated.

Remaining executable-eval work includes:

```text
normalize first-eight legacy aliases/errata
serialize controlled variants/metamorphic relations
coverage linter/equivalent
human adjudication independent of model predictions
bind high-harm forbidden outcomes to reducer/integration/security tests
execute repeated-run/stability evaluations where relevant
```

## Core architecture

```text
Authorized evidence
      ↓
Message zoning / normalization
      ↓
Communication understanding
      ↓
Responsibility admission
      ├─ DO_NOT_TRACK -> no Responsibility product state by default
      ├─ NEEDS_REVIEW -> narrow AdmissionReview when durable/surfaced
      └─ TRACK
           ↓
Responsibility identity + reduction
      ↓
Evidence-relative canonical Responsibility state
      ↓
Safety / actionability policy
      ↓
Deterministic product projection
```

Central separation:

```text
Evidence ≠ Interpretation ≠ Admission ≠ Domain state ≠ Safe action ≠ UI projection
```

## Canonical semantic vector

Stable v0.1 Responsibility dimensions:

```text
resolution status/reason
× live tracking activation
× attention/defer
× obligation legs/actionability/conditions
× expected events
× completion criteria
× constraints
× pending proposals/agreed facts
× temporal facts
× uncertainty/risk
× provenance
```

Important negative rules now pressure-tested across all 44 cases include:

```text
projection equality != semantic equality
linguistic verb count != obligation-leg count
extracted temporal phrase != accepted TemporalFact
USER-originated fact != field override
quoted/forwarded text may supply context without current communicative authority
CC membership != obligation bearer
semantic approval != authoritative approval satisfaction
capability != commitment
preference != agreement
DO_NOT_TRACK != fake resolved Responsibility
admission Review != field Review inside Responsibility
REOPEN != rewind prior history
```

## Frozen L1 logical persistence boundary

Authoritative L1 decision lives in `PHYSICAL-SCHEMA-FREEZE-REVIEW.md`.

Conceptually:

```text
# Accepted Responsibility state
Responsibility
ObligationLeg[]
ExpectedEvent[]
TemporalFact[]
FieldDecision[]
ProvenanceReference[]
DomainEvent[]
SemanticDetails (typed/versioned aggregate-local document)

# Accepted unresolved pre-admission product state
AdmissionReview[]

# Separate evidence/inference systems
Message / Attachment / provider observations
AIInterpretationRun

# Separate operational authorities
TemporalContract / TemporalTrigger
Draft / SendOperation
```

The typed aggregate-local details boundary currently owns concepts such as:

```text
completion criteria
constraints
pending proposals/agreed facts
field-scoped uncertainties
unresolved ANY_OF/shared assignment semantics
target-scoped risk detail when no normalized owner is more natural
```

Normalization is added later only when real query/FK/concurrency/authorization/scheduling pressure justifies it.

## L2 requirements before exact DDL approval

The logical boundary is frozen, but exact DDL must still prove:

```text
mechanical source-event idempotency
stale-safe evidence_revision + aggregate_version writes
narrow/current FieldDecision authority
conflict-friendly TemporalFact currentness
stable IDs + migration/versioning for semantic_details
role-aware provenance where multiple source zones jointly support a fact
target-scoped risk semantics
account/scope/FK integrity
AdmissionReview stale/idempotent user resolution
```

A parent projection bucket, if cached later, must remain rebuildable and non-authoritative.

## Conceptual terminology

`Responsibility` is the canonical semantic concept: a communication-bounded, trackable operational obligation / expected-outcome loop with coherent closure.

The physical table name will be chosen at L2; older `ActionItem` terminology must not be kept by inertia.

## Current implementation gate

The next authorized design step is:

> **L2 exact PostgreSQL/Drizzle DDL design + independent DDL acceptance review.**

Do **not** write migrations yet.

The L2 artifact must map every table/column/constraint/index/typed-details field back to a frozen L1 requirement, canonical oracle, query path, or concurrency/security invariant. Anything without such justification should be removed.

## Change policy

This is a living, versioned specification.

A stronger canonical scenario, organic/production failure, or better evidence may reopen L0/L1, but only through an explicit versioned decision recording:

```text
what changed
what evidence/counterexample changed it
which artifacts/evals are affected
why the replacement is safer/better
```

Do not preserve stale consistency when stronger evidence contradicts it.