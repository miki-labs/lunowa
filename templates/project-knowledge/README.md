# Project Knowledge Starter

Use this directory as a **selective menu**, not a mandatory documentation tree.

A template existing here does not mean every product should copy it.

## Start smaller than you think

### Prototype / experiment

Usually begin with only what makes the repository runnable and legible:

```text
README.md
AGENTS.md        # when coding agents are used
```

Product intent may remain in the README or current task while the idea is still deliberately disposable.

### Non-trivial product moving toward production

Add durable product/architecture context when future work would otherwise need to reconstruct it repeatedly:

```text
AGENTS.md

docs/
  PRODUCT.md
  ARCHITECTURE.md
```

### Add only when justified

- `DESIGN.md` — when durable UX/interaction/accessibility rules materially constrain implementation.
- `QUALITY.md` — when project-specific verification rules are richer than a canonical `verify` command and blueprint defaults.
- `FEATURE-SPEC.md` — copy into `docs/specs/` only for durable feature behavior complex enough to need an explicit current specification.
- `docs/decisions/` — only for durable/costly/security/architecture-significant decisions.
- `docs/plans/active/` — only for complex, risky, cross-cutting, or long-running execution.
- `docs/plans/completed/` — retain only completed plans whose history remains useful.

Do not create empty directories or placeholder documents merely to look mature.

## Template roles

- `AGENTS.md` — short map, canonical commands, and high-value repository-local rules.
- `PRODUCT.md` — accepted engineering-facing product intent; not the entire research/backlog/growth system.
- `DESIGN.md` — durable UX/interaction/accessibility rules when relevant.
- `ARCHITECTURE.md` — current system model, ownership, contracts, trust boundaries, and invariants.
- `QUALITY.md` — project-specific Definition of Done and verification contract when needed.
- `FEATURE-SPEC.md` — current durable feature behavior, not a task ticket or implementation plan.

## Reusable change templates

Use the smallest artifact that matches the risk:

- implementation task/change and normal lightweight design: `templates/task-contract.md`,
- high-risk or architecture-affecting design: `templates/design-doc.md`,
- complex execution: `templates/implementation-plan.md`,
- durable decision: `templates/decision-record.md`,
- security-sensitive work: `templates/threat-model.md`,
- launch readiness: `templates/production-readiness-checklist.md`.

Do not create both a task contract and design document when the task contract already contains enough design evidence. Escalate to the full design document only when the risk/uncertainty warrants it.

See `docs/repository-knowledge.md` for knowledge promotion, authority-by-question, conflict handling, retrieval, and lifecycle rules.
