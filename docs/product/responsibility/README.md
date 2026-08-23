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
- `TRANSITION-ORACLES.md` — semantic traces for all 20 mandatory transition/event sequences.

## Current coverage-design status

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

`mapped` is not the same as:

```text
implemented
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

The stable v0.1 dimensions are:

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

## Conceptual terminology

`Responsibility` is the canonical semantic concept name. It means a communication-bounded, trackable operational obligation / expected-outcome loop with a coherent closure condition.

The physical entity/table name is an implementation choice; `ActionItem` should not be retained merely because the older model used it.

## Current implementation gate

The prior documentation stop condition caused by conflicting legacy lifecycle semantics is now satisfied: Architecture, Data Model, Contracts, and Interactions have been reconciled.

The remaining gate before domain/persistence implementation is different:

> choose the **minimal physical representation** that satisfies the validated scenarios/transitions without reintroducing the superseded single lifecycle model or building a generic workflow engine.

Before schema freeze, remaining Tier-0 oracle expansion and executable fixture normalization should continue to pressure-test that representation.

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