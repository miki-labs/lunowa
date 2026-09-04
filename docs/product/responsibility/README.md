# Responsibility semantics

## Status

**Accepted Responsibility v0.1 semantic baseline, L1 logical persistence boundary, and L2 exact PostgreSQL/Drizzle schema frozen at DDL v0.4.**

Freeze/proof levels:

```text
L0 semantic model                         FROZEN v0.1 baseline
L1 logical persistence boundary           FROZEN v0.1 baseline
L2 exact PostgreSQL/Drizzle schema         FROZEN — DDL v0.4
L2 executable proof                        PASS (60/60 acceptance IDs)
L2 final freeze                            PASS/FREEZE through Issue #15
L3 migrations/runtime                      NOT AUTHORIZED by this freeze
```

`FROZEN` means “versioned baseline that requires an explicit superseding decision if stronger evidence breaks it.” It does not mean immutable forever.

The DDL v0.4 freeze is exact-schema authority earned through the accepted executable proof and independent Issue #15 audit. It is **not migration authority**.

---

## Scope and precedence

This directory is normative for Responsibility semantics, annotation/evaluation behavior, the frozen L1 persistence boundary, the frozen L2 schema, and its proof contract.

Broader documents such as:

```text
docs/product/ARCHITECTURE.md
docs/product/DATA-MODEL.md
docs/product/CONTRACTS.md
docs/design/INTERACTIONS.md
```

have been reconciled against v0.1. If a future contradiction appears, treat it as a specification defect and reconcile it explicitly.

This directory still does **not** authorize:

- production migrations;
- runtime reducer implementation merely from the frozen DDL;
- provider/AI activation;
- cross-thread Responsibility merging;
- recurring Responsibility machinery;
- generic team workflow machinery.

The following also remain implementation/runtime decisions rather than frozen global vocabularies:

- action/event/basis code registries;
- FieldDecision field/value registry;
- exact semantic-details validation library;
- machine-key hashing/encoding implementation;
- query/repository helper names.

---

## Documents

### Semantic / evaluation authority

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

### Persistence design / audit authority

- `PHYSICAL-MODEL-DESIGN.md` — original hybrid persistence candidate used as the falsifiable starting point.
- `PHYSICAL-MODEL-AUDIT.md` — first adversarial physical-model pass.
- `PHYSICAL-MODEL-AUDIT-BATCH-3.md` — second pass; adds pre-admission Review and narrows several structures.
- `PHYSICAL-MODEL-AUDIT-BATCH-4.md` — final Tier-0 falsifier pass; finds no new aggregate/table requirement and adds expected-event/provenance metadata pressure.
- `PHYSICAL-SCHEMA-FREEZE-REVIEW.md` — authoritative L1 freeze decision, final L2 decision, and acceptance matrix.
- `POSTGRESQL-DRIZZLE-DDL-DESIGN.md` — exact L2 PostgreSQL/Drizzle schema authority, frozen at DDL v0.4.
- `POSTGRESQL-DRIZZLE-DDL-AUDIT.md` — first exact-DDL adversarial audit; initial candidate failed and was corrected.
- `POSTGRESQL-DRIZZLE-DDL-AUDIT-PASS-2.md` — second exact-DDL pass, including CREATE freshness / Conversation evidence-revision pressure.
- `POSTGRESQL-DRIZZLE-DDL-AUDIT-PASS-3.md` — third exact-DDL pass, including tenant/AI-run/reference hardening.
- `L2-EXECUTABLE-PROOF-GATE.md` — authoritative execution/evidence gate and completed proof record for exact L2.
- `../../decisions/0010-responsibility-l2-exact-schema-freeze.md` — durable L2 PASS/FREEZE decision and provenance.

---

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

This is **not** full executable/production evidence.

Remaining semantic-eval work includes:

```text
normalize first-eight legacy aliases/errata for executable serialization
serialize controlled variants/metamorphic relations
coverage linter/equivalent
human adjudication independent of model predictions
bind high-harm forbidden outcomes to reducer/integration/security tests
execute repeated-run/stability evaluations where relevant
```

---

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

---

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

Important negative rules pressure-tested across all 44 cases include:

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

---

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

---

## Current L2 frozen schema

The frozen v0.4 exact schema uses exactly eight Responsibility-owned tables:

```text
responsibilities
responsibility_expected_events
responsibility_obligation_legs
responsibility_temporal_facts
responsibility_field_decisions
responsibility_admission_reviews
responsibility_domain_events
responsibility_provenance_refs
```

Important executable invariants include:

```text
Conversation semantic_evidence_revision coordinates admission/matching freshness
Responsibility accepted_evidence_revision records last accepted basis
CREATE idempotency is global (application_key, effect_key), not target-ID scoped
same-Responsibility child links use composite FKs where cheap/material
same-user participant / AI-run links are mechanically constrained
same-account Responsibility/Review/Message provenance is mechanically constrained
TemporalFact preserves DATE vs INSTANT vs UNRESOLVED and conflict candidates
AdmissionReview prevents same-revision stale resurrection
semantic_details is typed/versioned and runtime validated
```

The accepted Drizzle-generated SQL and PostgreSQL evidence prove these statements rather than relying on TypeScript definitions.

---

## L2 executable proof and freeze record

The proof and independent review are complete:

```text
Issue #13
  PostgreSQL 18 + Drizzle schema proof
  acceptance IDs 01–46, 50–60 except auth IDs

Issue #14
  Better Auth UUID persistence proof
  acceptance IDs 47–49

Issue #15
  independent combined review — PASS/FREEZE recorded in ADR 0010
```

Authoritative execution/evidence rules live in `L2-EXECUTABLE-PROOF-GATE.md`.

No test may be considered PASS from mocks or builder summary alone when the gate requires PostgreSQL/Drizzle/runtime evidence.

---

## Current implementation gate

The L2 proof/freeze gate is complete. The next production work, when separately authorized, is an L3 implementation task; the freeze itself does not authorize migrations or runtime.

The freeze leaves these implementation boundaries in force:

```text
production ownership/prerequisite tables must be supplied by their owning tasks
external FK/index contracts must be preserved in production topology
production migration/runtime requires separate explicit L3 authorization
```

The exact schema must not be reopened by proof-fixture topology or implementation convenience. A later exact-DDL defect requires an explicit versioned decision and appropriate re-proof.

---

## Conceptual terminology

`Responsibility` is the canonical semantic concept: a communication-bounded, trackable operational obligation / expected-outcome loop with coherent closure.

Older `ActionItem` terminology must not be kept by inertia.

---

## Change policy

This is a living, versioned specification.

A stronger canonical scenario, executable DB failure, organic/production failure, or better evidence may reopen a prior decision, but only through an explicit versioned decision recording:

```text
what changed
what evidence/counterexample changed it
which artifacts/evals are affected
why the replacement is safer/better
```

A failing executable L2 test should first be classified as:

```text
DDL defect
Drizzle representation defect
runtime protocol defect
test-harness defect
platform/version incompatibility
L1 semantic/persistence-boundary falsifier
```

Only the final category automatically reopens L1.

Do not preserve stale consistency when stronger evidence contradicts it.
