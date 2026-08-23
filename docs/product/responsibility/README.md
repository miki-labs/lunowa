# Responsibility semantics

## Status

**Accepted Responsibility v0.1 semantic baseline for annotation, scenario design, and later domain reconciliation.**

This is a versioned semantic baseline, not a frozen physical schema or proof that runtime behavior has been implemented/passed.

This directory records the product semantics used to understand communication, admit trackable responsibilities, evaluate AI interpretation, reduce evidence into Responsibility state, apply safety/actionability policy, and project that state into Lunowa UI.

## Scope and precedence

This directory is normative for **Responsibility semantics and annotation/evaluation behavior**.

Existing documents such as `../DATA-MODEL.md`, `../CONTRACTS.md`, and `../../design/INTERACTIONS.md` remain useful/authoritative for their broader scopes. However, their older Responsibility-specific single-lifecycle/scalar-owner/single-deadline shapes predate this v0.1 work.

For Responsibility semantics, use this directory first.

### Implementation stop condition

Until the older Responsibility-specific sections are explicitly reconciled, **do not implement the legacy `ActionItem` lifecycle model from `DATA-MODEL.md`, `CONTRACTS.md`, or `INTERACTIONS.md` merely because those files are otherwise accepted/current documents.**

The reconciliation findings and compatibility rules are recorded in `CONSISTENCY-AUDIT.md`.

This directory does **not** freeze:

- SQL tables or ORM types;
- exact enum names;
- model/provider choice;
- prompts;
- numeric confidence/risk thresholds;
- similarity thresholds;
- number of AI retries/reruns;
- cross-thread responsibility merging;
- recurring responsibility machinery;
- generic team workflow machinery.

## Documents

- `ANNOTATION-GUIDELINES.md` — normative definitions, evidence/communication/admission/identity/safety boundaries, and annotation decision procedure.
- `DECISIONS.md` — FIXED principles, strong implementation directions, open questions, and superseded decisions.
- `CONSISTENCY-AUDIT.md` — cross-document audit, reconciled semantic vector, compatibility aliases, oracle errata, and implementation stop conditions.
- `SCENARIO-SCHEMA.md` — canonical focal-event scenario/evaluation contract after consistency reconciliation.
- `TRANSITION-SCHEMA.md` — multi-event trace contract with semantic/observed chronology, evidence revisions, composite `effects[]`, conditional activation, and step-level forbidden outcomes.
- `COVERAGE-PLAN.md` — corpus-level mandatory coverage inventory, contrasts/interactions, semantic mutants, transition traces, metamorphic relations, and completion gates.
- `TIER-0-SCENARIO-MATRIX.md` — first 44 base semantic-oracle assignments and controlled variants. Earlier transition `8/20` text in that assignment document is historical; current transition design coverage is defined by the dedicated transition artifacts.
- `TIER-0-CRITICAL-ORACLES.md` — full layered oracles for the first eight highest-risk/highest-connectivity Tier-0 cases. Legacy aliases/errata are normalized through `CONSISTENCY-AUDIT.md` before executable serialization.
- `TRANSITION-ORACLES.md` — semantic traces for all 20 mandatory transition/event sequences.

## Current coverage-design status

At the specification/design level, the mandatory inventory is mapped for:

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

The central separation is deliberate:

```text
Evidence ≠ Interpretation ≠ Domain state ≠ Safe action ≠ UI projection
```

The model may help interpret language, but it is not the authority for provider facts, authorization, irreversible side effects, or domain invariants.

## Canonical semantic-vector direction

After scenario + transition stress testing and consistency audit, the stable semantic dimensions are:

```text
resolution status
× live tracking activation
× attention/defer
× obligation legs / actionability
× expected events / completion criteria
× temporal facts
× uncertainty / risk
× provenance
```

Exact physical tables/fields/enums remain open.

Existing v0.1 oracle shorthand such as `tracking_status` or `active_obligations[]` is governed by compatibility rules in `CONSISTENCY-AUDIT.md`; new oracles should use the reconciled schema.

## Conceptual terminology

`Responsibility` is the canonical semantic concept name. It means a communication-bounded, trackable operational obligation / expected-outcome loop with a coherent closure condition.

The current physical entity name `ActionItem` is not renamed merely by these documents.

## Change policy

This is a living, versioned specification.

Strong counterexamples from canonical scenarios, transition traces, organic/production failures, or better evidence may supersede v0.1 decisions. When a decision changes, record:

```text
what changed
what evidence/counterexample changed it
which artifacts/evals are affected
why the replacement is safer/better
```

Do not silently preserve consistency with an older decision when stronger evidence contradicts it.