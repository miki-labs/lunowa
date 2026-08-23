# Responsibility semantics

## Status

**Accepted Responsibility v0.1 semantic baseline for annotation, scenario design, architecture/domain reconciliation, and later implementation.**

This is a versioned semantic baseline, not a frozen physical schema or proof that runtime behavior has been implemented/passed.

This directory records the product semantics used to understand communication, admit trackable Responsibilities, reduce evidence into accepted state, apply safety/actionability policy, and project that state into Lunowa UI.

## Scope and precedence

This directory is normative for **Responsibility semantics and annotation/evaluation behavior**.

The broader Responsibility-related sections of:

```text
docs/product/ARCHITECTURE.md
docs/product/DATA-MODEL.md
docs/product/CONTRACTS.md
docs/design/INTERACTIONS.md
```

have now been reconciled against v0.1. They may define broader architectural/data/API/interaction concerns, but should not contradict the semantic decisions here.

If a future contradiction appears, treat it as a specification defect and reconcile it explicitly rather than silently guessing.

This directory does **not** freeze:

- SQL tables or ORM types;
- exact enum names/cardinality;
- physical child-table vs JSON choices for obligation legs/events/criteria;
- model/provider choice;
- prompts;
- numeric confidence/risk thresholds;
- similarity thresholds;
- number of AI retries/reruns;
- cross-thread Responsibility merging;
- recurring Responsibility machinery;
- generic team workflow machinery.

## Documents

- `ANNOTATION-GUIDELINES.md` — normative evidence/communication/admission/identity/safety definitions and annotation procedure.
- `DECISIONS.md` — FIXED principles, strong implementation directions, OPEN questions, and superseded decisions.
- `CONSISTENCY-AUDIT.md` — cross-document reconciliation, compatibility aliases, oracle errata, and remaining promotion gates.
- `SCENARIO-SCHEMA.md` — canonical focal-event scenario/evaluation contract.
- `TRANSITION-SCHEMA.md` — multi-event trace contract with semantic/observed chronology, evidence revisions, composite `effects[]`, conditional activation, and step-level forbidden outcomes.
- `COVERAGE-PLAN.md` — corpus-level mandatory coverage inventory, contrasts/interactions, semantic mutants, transition traces, metamorphic relations, and completion gates.
- `TIER-0-SCENARIO-MATRIX.md` — first 44 base semantic-oracle assignments and controlled variants. Its earlier transition `8/20` section is historical; current transition design coverage is defined by the dedicated transition artifacts.
- `TIER-0-CRITICAL-ORACLES.md` — full layered oracles for the first eight high-risk/high-connectivity Tier-0 cases. Legacy aliases/errata are normalized using `CONSISTENCY-AUDIT.md` before executable serialization.
- `TIER-0-DETAILED-ORACLES-BATCH-2.md` — ten additional full layered base oracles using the reconciled state-vector vocabulary, plus the explicit observation-confirmed C23 counterpart.
- `TIER-0-DETAILED-ORACLES-BATCH-3.md` — ten schema-falsifier oracles covering outbound direction, USER target/source due, REOPEN/new episode, sequential-vs-independent outcomes, and admission-level ambiguity/missing-context/user-dependent review.
- `TRANSITION-ORACLES.md` — semantic traces for all 20 mandatory transition/event sequences.
- `PHYSICAL-MODEL-DESIGN.md` — **non-frozen** hybrid relational/typed-details persistence candidate derived from the current oracle pressure. It is a falsifiable design input for Phase 2, not migration authority.
- `PHYSICAL-MODEL-AUDIT.md` — first adversarial review of that candidate; requires directly queryable field authority, target-scoped risk, mechanical evidence idempotency, stable IDs/versioning inside typed semantic details, and additional schema-falsifier gates before freeze.
- `PHYSICAL-MODEL-AUDIT-BATCH-3.md` — second adversarial pass; adds the pre-admission Review boundary, narrows `FieldDecision`, rejects one-leg-per-verb persistence, and verifies REOPEN/multi-aggregate/outbound semantics against the hybrid candidate.

## Current coverage-design status

Corpus assignment / transition design coverage:

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

Detailed one-event Tier-0 oracle expansion:

```text
base cases fully layered: 28 / 44
explicit C23 claim-vs-observation pair: complete at specification level
remaining base cases requiring full layered expansion: 16 / 44
```

The first eight detailed cases remain under documented compatibility aliases until executable serialization. Batch 2 and Batch 3 use the reconciled vocabulary directly.

`mapped` or `fully layered` is not the same as:

```text
implemented
serialized as executable fixtures
executed
passed
production-validated
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
Evidence ≠ Interpretation ≠ Domain state ≠ Safe action ≠ UI projection
```

The model may help interpret language, but it is not authority for provider facts, authorization, irreversible side effects, or domain invariants.

## Canonical semantic vector

The stable v0.1 Responsibility dimensions are:

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

Exact physical representation remains open.

Existing detailed-oracle shorthand such as `tracking_status` or `active_obligations[]` is governed by compatibility rules in `CONSISTENCY-AUDIT.md`; new executable fixtures use the reconciled schema.

## Admission-level Review boundary

Batch 3 establishes an important boundary **before** canonical Responsibility creation.

When admission itself is unresolved:

```text
NEEDS_REVIEW
```

must not be implemented by creating a fake Responsibility with an `UNKNOWN` lifecycle/state.

The product Review surface may combine two internally distinct sources:

```text
A. admitted Responsibility + material field-level uncertainty/conflict
B. pre-admission Review candidate + Responsibility existence/relevance unresolved
```

T0-028 is class A. T0-041/T0-043/T0-044 are class B.

The current physical-model audit therefore prefers a narrow durable pre-admission review artifact when such a candidate is surfaced or requires user resolution. Its exact table/enum naming remains open.

## New schema pressure from Batch 2 and Batch 3

The detailed expansion now demonstrates all of these distinctions:

```text
pending proposal != agreed fact
blocked known obligation != forgotten obligation
hold constraint != attention defer
cancellation resolution != satisfaction
intent to delegate != effective delegation
partial criterion completion != Responsibility completion
historical evidence-relative OPEN != live activated work
ANY_OF assignment ambiguity != BOTH/every-recipient ownership
claim + matching observation can close a narrow fact without creating a global evidence hierarchy
SOURCE_DUE can belong to USER or OTHER obligation legs
USER_TARGET != source-field correction
REOPEN != rewind all prior child history
one Responsibility != one database row per linguistic verb
one source message may CREATE multiple independent Responsibilities
admission Review != admitted Responsibility field Review
missing context must remain revision/provenance-grounded
```

Any minimal physical model that cannot express these without overloaded state fields should be rejected before migrations are written.

## Physical-model candidate status

The accepted-Responsibility side currently prefers a hybrid boundary:

```text
normalized parent orthogonal state
+ normalized obligation legs
+ normalized expected events
+ normalized material temporal facts
+ normalized field decisions/provenance/history
+ strictly typed/versioned low-query semantic details
```

The physical-model audits strengthen/narrow that candidate with these requirements:

```text
current field-scoped user authority must be directly queryable
FieldDecision is for explicit authority/correction, not every USER-originated fact
risk is target-scoped; any parent aggregate risk is only a derived summary
duplicate evidence application needs a mechanical idempotency/source-event boundary
stable IDs/versioning are required inside typed semantic details
REOPEN preserves prior child/history rather than blindly rewinding it
obligation-leg granularity follows independent state/query pressure, not verb count
pre-admission surfaced Review needs a separate narrow durable artifact rather than a fake Responsibility
```

The current candidate boundary is therefore conceptually:

```text
# accepted Responsibility state
responsibilities
responsibility_obligation_legs
responsibility_expected_events
responsibility_temporal_facts
responsibility_field_decisions
responsibility_provenance_refs
responsibility_domain_events
responsibilities.semantic_details_jsonb

# accepted pre-admission review state
responsibility_admission_reviews      # candidate name only

# separate evidence/inference systems
Messages / Attachments / provider observations
AI interpretation runs
Temporal Contracts / Triggers
Draft / SendOperation
```

The physical design remains deliberately **candidate-only**. Remaining oracles are still adversarial schema tests. If they expose a cheaper or necessary representation, the physical design changes before code/migrations.

## Conceptual terminology

`Responsibility` is the canonical semantic concept name. It means a communication-bounded, trackable operational obligation / expected-outcome loop with a coherent closure condition.

The physical entity/table name is an implementation choice; `ActionItem` should not be retained merely because the older model used it.

## Current implementation gate

The prior documentation stop condition caused by conflicting legacy lifecycle semantics is satisfied: Architecture, Data Model, Contracts, Interactions, responsive/design routing, technology guidance, and relevant ADRs have been reconciled.

The remaining gate before domain/persistence implementation is:

> accept the **minimal physical representation** that satisfies the validated scenarios/transitions without reintroducing the superseded single lifecycle model or building a generic workflow engine.

Before schema freeze:

1. finish the remaining high-value Tier-0 detailed oracles, especially commitment strength, preference/approval, courtesy/materiality, assignment/CC, quote/forward zoning, and non-literal ambiguity;
2. explicitly challenge whether any of those cases require a new accepted persistence structure beyond the current hybrid + pre-admission Review boundary;
3. normalize the first eight legacy detailed-oracle aliases/errata during executable serialization;
4. keep the C23 claim-only and observation-confirmed cases as two explicit executable inputs;
5. require HIGH/CRITICAL forbidden outcomes at the owning verification layer;
6. mechanically guard mandatory coverage IDs from disappearance;
7. perform a schema-freeze review mapping each proposed column/table/invariant to concrete oracles/query paths;
8. only after those gates, convert the accepted minimal model into Drizzle/PostgreSQL migrations.

## Change policy

This is a living, versioned specification.

Strong counterexamples from canonical scenarios, transition traces, organic/production failures, or better evidence may supersede v0.1 decisions. When a decision changes, record:

```text
what changed
what evidence/counterexample changed it
which artifacts/evals are affected
why the replacement is safer/better
```

Do not preserve stale consistency when stronger evidence contradicts it.