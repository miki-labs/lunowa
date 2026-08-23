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
- `SCENARIO-SCHEMA.md` — contract for describing one canonical scenario/evaluation oracle.
- `COVERAGE-PLAN.md` — corpus-level mandatory coverage inventory, contrast/interactions, semantic mutants, transition traces, metamorphic relations, and completion gates.
- `TIER-0-SCENARIO-MATRIX.md` — first 44 base semantic-oracle assignments, controlled variants, contrast mapping, mutant-kill mapping, and explicit transition-coverage remainder.

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

This is a living specification. Strong counterexamples from the canonical scenario matrix, production failures, or better evidence may supersede v0.1 decisions. When a decision changes, record what changed and why rather than silently rewriting history.
