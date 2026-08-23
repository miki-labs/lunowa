# Responsibility semantics

## Status

**Responsibility Annotation Guideline v0.1 candidate.**

This directory records the product semantics used to understand communication, admit trackable responsibilities, evaluate AI interpretation, and project responsibility state into Lunowa UI.

The purpose is to preserve a stable external source of truth before implementation details harden around an underspecified model.

## Scope and precedence

This directory is normative for **responsibility semantics and annotation/evaluation behavior**.

Existing documents such as `../DATA-MODEL.md`, `../CONTRACTS.md`, and `../../design/INTERACTIONS.md` remain authoritative for their current broader scopes. However, some older responsibility-specific details in those files predate this guideline, including the single `LifecycleState`, scalar `next_owner`, one `deadline_at`, and whole-item `user_override_state` concepts.

Until those files are reconciled, do not treat those older responsibility-specific shapes as stronger than the principles recorded here.

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

- `ANNOTATION-GUIDELINES.md` — normative definitions, invariants, and annotation decision procedure.
- `DECISIONS.md` — fixed principles, strong directions, open questions, and superseded decisions.
- `SCENARIO-SCHEMA.md` — contract for describing one canonical focal-event scenario/evaluation oracle, refined from demonstrated Tier 0 needs.
- `TRANSITION-SCHEMA.md` — multi-event trace extension with semantic/observed chronology, evidence revisions, composite `effects[]`, branch semantics, and step-level forbidden outcomes.
- `COVERAGE-PLAN.md` — corpus-level mandatory coverage inventory, contrast/interactions, semantic mutants, transition traces, metamorphic relations, and completion gates.
- `TIER-0-SCENARIO-MATRIX.md` — first 44 base semantic-oracle assignments, controlled variants, contrast mapping, and mutant-kill mapping. Its earlier transition-coverage remainder is superseded by the dedicated transition oracle document below.
- `TIER-0-CRITICAL-ORACLES.md` — full layered oracles for the first eight highest-risk/highest-connectivity Tier 0 cases; this is the first detailed expansion used to pressure-test the scenario schema itself.
- `TRANSITION-ORACLES.md` — full semantic traces for all 20 mandatory transition/event sequences, including negotiation, send reconciliation, follow-up, hold/resume, supersession, out-of-order ingestion, stale AI runs, parallel obligations, conditional activation, temporal-anchor re-resolution, and historical activation.

## Current coverage-design status

At the specification/design level, the mandatory inventory is now mapped for:

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

`mapped` is not the same as `implemented`, `executed`, or `passed`. Runtime verification remains future work.

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
Canonical evidence-relative responsibility state
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

## Conceptual terminology

`Responsibility` is the canonical concept name in this specification. It means a communication-bounded, trackable operational obligation / expected outcome loop. The current physical entity name `ActionItem` is not renamed by this document.

## Change policy

This is a living specification. Strong counterexamples from the canonical scenario matrix, transition traces, production failures, or better evidence may supersede v0.1 decisions. When a decision changes, record what changed and why rather than silently rewriting history.
